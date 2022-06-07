import { PageRunner, runRuleTests } from "../runRuleTests";
import { testCases } from "../../__test-utils__/utils";

describe(`run-rule-tests`, () => {
  it('passes the test case to pageRunner', async () => {
    const [testCase] = testCases;
    const pageRunner: PageRunner = async (tc) => {
      expect(tc).toBe(testCase);
    }
    const results = await runRuleTests(pageRunner, [testCase]);
    expect(results).toEqual([]);
  });

  test(`returns an array of reports for each test cases`, async () => {
    const [testCase1, testcase2] = testCases;
    const report = { "@context": {}, "@graph": [] }
    const pageRunner: PageRunner = async () => {
      return report 
    }
    const results = await runRuleTests(pageRunner, [testCase1, testcase2]);
    expect(results).toEqual([report, report]);
  });
});
