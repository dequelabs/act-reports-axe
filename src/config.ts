import type { RunOptions } from 'axe-core'

/**
 * List of rule id(s) to ignore running axe-core against
 */
export const ignoreRulesIds = [
  /**
   * Rule: meta element has no refresh delay
   * Url: https://act-rules.github.io/rules/bc659a
   *  - This is ignored from generating a mapping in axe-core
   */
  "bc659a"
];

/**
 * File extensions for which to ignore running `axe`
 */
export const inapplicableFileExtensions = ["js", "xml", "svg"];

/**
 * Specific options/ config to pass to `axe.run` per ruleId
 */
export const rulesAxeOptions: Record<string, RunOptions> = {
  /**
   * Rule: role attribute has valid value
   * Url: https://act-rules.github.io/rules/674b10
   *  - Disable below checks
   *    - `fallbackrole`
   */
  "674b10": ({
    checks: {
      fallbackrole: { enabled: false }
    }
  } as unknown as RunOptions)
};

export const manualRulesMapping: Record<string, string[]> = {
  /**
   * Rule: meta viewport does not prevent zoom
   * Url: https://act-rules.github.io/rules/b4f0c3
   */
  b4f0c3: ["meta-viewport"]
};
