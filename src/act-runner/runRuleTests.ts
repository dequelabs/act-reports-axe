import { EarlReport, TestCase } from "../types";

export type PageRunner = (testCase: TestCase) => Promise<EarlReport | void>

export const runRuleTests = async (pageRunner: PageRunner, testCases: TestCase[]) => {
  const testResults = [];
  for (const tc of testCases) {
    process.stdout.write(".");
    const results = await pageRunner(tc);
    if (results) {
      testResults.push(results);
    }
  }
  return testResults;
};
