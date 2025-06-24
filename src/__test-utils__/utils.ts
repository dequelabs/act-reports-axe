import { readFileSync } from 'fs'
import puppeteer, { Page } from "puppeteer";
import { TestCase } from '../types';

const testCaseJson = readFileSync(__dirname + "/data/testcases.json", 'utf8')
export const testCases = JSON.parse(testCaseJson).testcases as TestCase[];

export const setup = async (): Promise<{
  page: Page,
  testCases: TestCase[],
  teardown: () => Promise<void>
}> => {
  const browser = await puppeteer.launch({
        args: [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
      '--single-process'
    ],
  });
  const page = await browser.newPage();
  await page.setBypassCSP(true);

  const teardown = async (): Promise<void> => {
    await page.close();
    await browser.close();
  };
  return { page, testCases, teardown };
};

export const getTestCases = (): TestCase[] => {
  return testCases;
}
