import { Config, EarlReport } from "../../types";
import { runTestsInPage, startPuppeteer, stopPuppeteer } from "../runTestsInPage"
import { Browser, Page } from "puppeteer";

describe("runTestsInPage", () => {
  let page: Page;
  let browser: Browser;

  const emptyReport: EarlReport = {
    "@context": {},
    "@graph": []
  }
  const options: Config = {
    testCaseJson: './src/__test-utils__/data/testcases.json',
    ruleId: `73f2c2`,
    outFile: '.tmp/outfile.json'
  };

  beforeAll(async () => {
    ({ page, browser } = await startPuppeteer());
  });

  afterAll(async () => {
    await stopPuppeteer(page, browser);
  });

  test("calls the callback", async () => {
    let count = 0;
    await runTestsInPage(page, options, async () => {
      count++;
      return emptyReport;
    });
    expect(count).not.toBe(0);
  });

  test("passes a page to the callback", async () => {
    await runTestsInPage(page, options, async page => {
      expect(page).toHaveProperty("goto");
      expect(page).toHaveProperty("$eval");
      return emptyReport;
    });
  });

  test("passes a test case to the callback", async () => {
    await runTestsInPage(page, options, async (_, testcase) => {
      expect(testcase).toHaveProperty("url");
      expect(testcase).toHaveProperty("ruleSuccessCriterion");
      expect(testcase).toHaveProperty("ruleId");
      return emptyReport
    });
  });
});
