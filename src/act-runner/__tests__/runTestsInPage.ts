import { Config, EarlReport } from "../../types";
import { runTestsInPage } from "../runTestsInPage"

describe("runTestsInPage", () => {
  let teardown: () => Promise<void>;

  const emptyReport: EarlReport = {
    "@context": {},
    "@graph": []
  }
  const options: Config = {
    testCaseJson: './src/__test-utils__/data/testcases.json',
    ruleId: `73f2c2`,
    outFile: '.tmp/outfile.json'
  };

  test("calls the callback", async () => {
    let count = 0;
    await runTestsInPage(options, async () => {
      count++;
      return emptyReport;
    });
    expect(count).not.toBe(0);
  });

  test("passes a page to the callback", async () => {
    await runTestsInPage(options, async page => {
      expect(page).toHaveProperty("goto");
      expect(page).toHaveProperty("$eval");
      return emptyReport;
    });
  });

  test("passes a test case to the callback", async () => {
    await runTestsInPage(options, async (_, testcase) => {
      expect(testcase).toHaveProperty("url");
      expect(testcase).toHaveProperty("ruleSuccessCriterion");
      expect(testcase).toHaveProperty("ruleId");
      return emptyReport
    });
  });
});
