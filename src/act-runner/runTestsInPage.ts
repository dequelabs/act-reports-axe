import puppeteer, { Page, Browser } from 'puppeteer';
import { runTestCases } from './runTestCases';
import { concatReport } from '../axe-reporter-earl/axeReporterEarl';
import { Config, ToolRunner, TestCase, EarlReport } from '../types';
import Axios from 'axios'

export async function runTestsInPage(page: Page, config: Config, toolRunner: ToolRunner): Promise<EarlReport> {
  const testResults = await runTestCases(config, (testCase: TestCase): Promise<EarlReport | void> => {
    return toolRunner(page, testCase);
  });
  return concatReport(testResults);
}

export async function startPuppeteer(): Promise<{page: Page, browser: Browser}> {
  const browser = await puppeteer.launch({
    args: [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote'
    ],
  });
  const page = await browser.newPage();
  await page.setBypassCSP(true);
  await page.setRequestInterception(true);

  // Chrome has no option to prevent meta refresh
  // So instead, we'll tweak any examples that has immediate refresh / redirects
  page.on("request", async request => {
    const url = request.url();
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
