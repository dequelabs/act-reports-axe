import { TestCase } from "../types";
import axios from 'axios';

type TestCaseGrouping = Record<string, TestCase[]>

/**
 * Get testcases of ACT Rules (eg: `https://act-rules.github.io/testcases.json`) and then group the same based on ruleId
 *
 * @param {String} testsJson path to testcases json
 * @param {String} ruleId (Optional) rule id to only fetch testcases for a given rule
 */
export const groupedTestCases = async (
  testCaseJson: string,
  ruleId?: string
): Promise<TestCase[][]> => {
  let testCasesData;
  try {
    testCasesData = (await axios.get(testCaseJson)).data as { testcases: TestCase[] }
  } catch (error) {
    throw new Error(`Given JSON - ${testCaseJson} cannot be read`);
  }
  const { testcases } = testCasesData;
  if (!testcases || !testcases.length) {
    throw new Error(`Given testcases JSON does not contain tests`);
  }

  const groupedTestcasesByRuleId = testcases.reduce((out: TestCaseGrouping, tc) => {
    if (!out[tc.ruleId]) {
      out[tc.ruleId] = [];
    }
    out[tc.ruleId].push(tc);
    return out;
  }, {});

  if (ruleId) {
    return [groupedTestcasesByRuleId[ruleId]];
  }

  return Object.values(groupedTestcasesByRuleId);
};
