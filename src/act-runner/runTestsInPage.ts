import puppeteer, { Page, Browser } from 'puppeteer';
import { runTestCases } from './runTestCases';
import { concatReport } from '../axe-reporter-earl/axeReporterEarl';
import { Config, ToolRunner, TestCase, EarlReport, Assertion, Assertor } from '../types';
import Axios from 'axios'

export async function runTestsInPage(
  page: Page,
  config: Config,
  toolRunner: ToolRunner
): Promise<EarlReport<Assertion | Assertor>> {
  const testResults = await runTestCases(config, (testCase: TestCase): Promise<EarlReport | void> => {
    return toolRunner(page, testCase);
  });
  return concatReport(testResults, config.assertor);
}

export async function startPuppeteer(singleProcess?: boolean): Promise<{page: Page, browser: Browser}> {
  const defaultArgs = [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox'
  ];
  const args = singleProcess ?
    [
      ...defaultArgs,
      '--single-process',
    ] : defaultArgs;
  const browser = await puppeteer.launch({ args });
  const page = await browser.newPage();
  await page.setBypassCSP(true);
  await page.setRequestInterception(true);

  // Chrome has no option to prevent meta refresh
  // So instead, we'll tweak any examples that has immediate refresh / redirects.
  // Test-case assets use www.w3.org root paths (`/WAI/content-assets/...`).
  // On Netlify those 404; the files are at `/content-assets/...`.
  page.on("request", async request => {
    const url = request.url();
    if (isNetlifyWaiAsset(url)) {
      (page as Page & { pendingAssetRewrite?: boolean }).pendingAssetRewrite = true;
    }
    const assetUrl = await netlifyAssetUrl(url);
    if (assetUrl) {
      request.continue({ url: assetUrl });
      return;
    }
    // Rules that have meta[refresh] elements
    if (!url.includes(`/bc659a/`) && !url.includes(`/bisz58/`)) {
      request.continue();
      return
    }
    try {
      let body = (await Axios.get<string>(url)).data;
      if (body.match(/content="\s*0+(;.*?"|")/)) {
        body = body.replace(/content=".*?"/g, 'content=""');
      }
      request.respond({ body });
    } catch {
      console.log(`Axios failed request for ${url}`);
      request.continue();
    }
  });

  return { page, browser };
}

export async function stopPuppeteer(page: Page, browser: Browser) {
  await page.close();
  await browser.close();
}

/**
 * Netlify serves test cases whose resource URLs still use the www.w3.org root
 * (`/WAI/content-assets/...`). When that path 404s, use `/content-assets/...`.
 */
function isNetlifyWaiAsset(rawUrl: string): boolean {
  try {
    const absolute = new URL(rawUrl);
    return absolute.hostname === "wai-wcag-act-rules.netlify.app"
      && absolute.pathname.startsWith("/WAI/");
  } catch {
    return false;
  }
}

const assetUrlCache = new Map<string, Promise<string | undefined>>();

function netlifyAssetUrl(rawUrl: string): Promise<string | undefined> {
  if (!isNetlifyWaiAsset(rawUrl)) return Promise.resolve(undefined);
  const cached = assetUrlCache.get(rawUrl);
  if (cached) return cached;
  const pending = resolveNetlifyAssetUrl(rawUrl);
  assetUrlCache.set(rawUrl, pending);
  return pending;
}

async function resolveNetlifyAssetUrl(rawUrl: string): Promise<string | undefined> {
  const absolute = new URL(rawUrl);
  if (await urlOk(absolute.href)) return;

  const fixed = new URL(absolute.href);
  fixed.pathname = absolute.pathname.replace(/^\/WAI\//, "/");
  if (!(await urlOk(fixed.href))) return;

  console.log(`Rewrote asset ${absolute.pathname} -> ${fixed.pathname}`);
  return fixed.href;
}

async function urlOk(href: string): Promise<boolean> {
  try {
    const response = await Axios.head(href, {
      timeout: 5000,
      validateStatus: () => true,
    });
    return response.status < 400;
  } catch {
    return false;
  }
}
