import { readFileSync } from 'fs'
import { TestCase } from '../types';

const testCaseJson = readFileSync(__dirname + "/data/testcases.json", 'utf8')
export const testCases = JSON.parse(testCaseJson).testcases as TestCase[];
export const getTestCases = (): TestCase[] => {
  return testCases;
}
