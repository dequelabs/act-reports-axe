import assert from "assert";
import { EarlReport, TestCase } from "../types";

export type PageRunner = (testCase: TestCase) => Promise<EarlReport | void>

export const runRuleTests = async (pageRunner: PageRunner, testCases: TestCase[]) => {
  const testResults = [];
  for (const tc of testCases) {
    process.stdout.write(".");
    const { ruleAccessibilityRequirements } = tc;
    if (!ruleAccessibilityRequirements) {
      return;
    }

    const tags = getWcagScs(ruleAccessibilityRequirements);
    if (hasAriaReqs(ruleAccessibilityRequirements)) {
      tags.push(`cat.aria`);
    }

    if (!tags || !tags.length) {
      continue;
    }

    const { ruleId, ruleName, url } = tc;
    const results = await pageRunner({
      ruleId,
      ruleName,
      url,
      ruleSuccessCriterion: tags
    } as TestCase);

    assert(
      typeof results === "object",
      "Expected `pageRunner` to return an object"
    );
    testResults.push(results);
  }

  process.stdout.write("\n");

  return testResults;
};

/**
 * Get an array of wcag success criterion tags
 *
 * @param {Object} accReqs accessibility requirements
 * @returns {String[]}
 */
function getWcagScs(accReqs: Record<string, string>): string[] {
  const wcagAccReqs = Object.keys(accReqs).filter(
    key => key.includes("wcag20") || key.includes("wcag21")
  );

  const ruleScs = wcagAccReqs
    .map(key => key.split(":").pop())
    .map(sc => "wcag" + sc?.replace(/\./g, ""));

  return ruleScs;
}

/**
 * Check if aria is a part of the accessibility requirements
 *
 * @param {Object} accReqs accessibility requirements
 * @returns {Boolean}
 */
function hasAriaReqs(accReqs: Record<string, string>) {
  return Object.keys(accReqs).some(key => key.includes("aria"));
}
