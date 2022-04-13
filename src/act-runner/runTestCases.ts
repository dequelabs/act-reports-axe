import * as fs from 'fs'
import * as path from 'path';
import { Config, TestCase, Assertion, EarlReport } from '../types';
import { groupedTestCases, loadTestCases } from './groupTestCases';
import { runRuleTests, PageRunner } from './runRuleTests';

export const runTestCases = async (
  config: Config, 
  pageRunner: PageRunner
): Promise<EarlReport[]> => {
  const { testCaseJson, ruleId } = config;
  const cacheResults = getCacheResults(config);
  const testCases = await loadTestCases(testCaseJson);
  const tests = groupedTestCases(testCases, ruleId);
  const results = [];

  for (let testcases of tests) {
    const { ruleName, ruleId } = testcases[0];
    console.log(`Testing: ${ruleName} (${ruleId})`);
    process.stdout.write("  ");

    const untestedCases: TestCase[] = [];
    testcases.forEach(testcase => {
      const testcaseCache = cacheResults
        .filter(({ subject }) => {
          return subject.source.includes(testcase.relativePath);
        })
        .map(assertion => ({ "@graph": [assertion] }));

      if (testcaseCache.length > 0) {
        results.push(...testcaseCache);
      } else {
        untestedCases.push(testcase);
      }
    });
    // Show cached results
    process.stdout.write(",".repeat(testcases.length - untestedCases.length));

    try {
      const ruleResults = await runRuleTests(pageRunner, untestedCases);
      if (ruleResults && ruleResults.length > 0) {
        results.push(...ruleResults);
      }
    } catch (e) {
      console.error(e);
    }
  }
  return results;
};

function getCacheResults({ outFile }: Config): Assertion[] {
  if (!fs.existsSync(outFile)) {
    return [];
  }
  return require(path.resolve(outFile))["@graph"];
}
