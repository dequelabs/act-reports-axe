import { readFileSync } from 'fs'
import axios from 'axios'
import { TestCase } from "../types";

type TestCaseGrouping = Record<string, TestCase[]>

/**
 * Get testcases of ACT Rules (eg: `https://act-rules.github.io/testcases.json`) and then group the same based on ruleId
 *
 * @param {String} testsJson path to testcases json
 * @param {String} ruleId (Optional) rule id to only fetch testcases for a given rule
 */
export const groupedTestCases = (
  testCases: TestCase[],
  ruleId?: string
): TestCase[][] => {
  const groupedTestcasesByRuleId = testCases.reduce((out: TestCaseGrouping, tc) => {
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

type TestCaseJson = {
  testcases: TestCase[]
}

export async function loadTestCases(testCaseJson: string): Promise<TestCase[]> {
  let testCasesData: TestCaseJson
  try {
    if (testCaseJson.includes('://')) {
      testCasesData = (await axios.get<TestCaseJson>(testCaseJson)).data
    } else {
      const fileContent = readFileSync(testCaseJson, 'utf8');
      testCasesData = (JSON.parse(fileContent) as TestCaseJson);
    }
  } catch (error) {
    throw new Error(`Given JSON - ${testCaseJson} cannot be read`);
  }
  const { testcases } = testCasesData;
  if (!testcases || !testcases.length) {
    throw new Error(`Given testcases JSON does not contain tests`);
  }
  return testcases;
}
