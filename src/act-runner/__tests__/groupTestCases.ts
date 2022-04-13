import { groupedTestCases } from "../groupTestCases"
import { getTestCases } from '../../__test-utils__/utils'

describe(`group-testcases`, () => {
  const testcases = getTestCases();
  const allResults = groupedTestCases(testcases);

  test(`get all testcases that are grouped`, () => {
    expect(allResults).toBeDefined();
    expect(allResults.length).toBeGreaterThan(1);
  });

  test.each(allResults)("has only testcases of the rule: %p", ruleTestcases => {
    const { url, ruleId } = ruleTestcases;
    expect(url.includes(ruleId));
  });

  const [ruleIdResults] = groupedTestCases(testcases, "73f2c2");
  test(`get testcases that are grouped by specified ruleId - 73f2c2 (Autocomplete valid)`, () => {
    expect(ruleIdResults).toBeDefined();
    expect(ruleIdResults.length).toBeGreaterThan(1);
  });

  test.each(ruleIdResults)(
    'has only testcases of the rule "Autocomplete valid (73f2c2)"',
    ruleTestcases => {
      const { url } = ruleTestcases;
      expect(url.includes('73f2c2'));
    }
  );
});
