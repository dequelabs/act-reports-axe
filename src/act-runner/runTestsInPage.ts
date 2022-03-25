import puppeteer, { Page, Browser } from 'puppeteer';
import { runTestCases } from './runTestCases';
import { concatReport } from '../axe-reporter-earl/axeReporterEarl';
import { Config, ToolRunner, TestCase, EarlReport } from '../types';

export async function runTestsInPage(config: Config, toolRunner: ToolRunner): Promise<EarlReport> {
  const { page, browser } = await startPuppeteer();
  const testResults = await runTestCases(config, (testCase: TestCase): Promise<EarlReport | void> => {
    return toolRunner(page, testCase);
  });

  await stopPuppeteer(page, browser);
  return concatReport(testResults);
}

async function startPuppeteer(): Promise<{page: Page, browser: Browser}> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setBypassCSP(true);
  return { page, browser };
}

async function stopPuppeteer(page: Page, browser: Browser) {
  await page.close();
  await browser.close();
}
