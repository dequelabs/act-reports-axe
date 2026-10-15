import { getAxeRuleIdsToRun } from "../axeRunTestCase";

describe("getAxeRuleIdsToRun", () => {
  test("uses axe-core ACT mappings", () => {
    expect(getAxeRuleIdsToRun("97a4e1")).toContain("button-name");
  });

  test("adds manual ACT mappings", () => {
    expect(getAxeRuleIdsToRun("2t702h")).toContain("summary-name");
  });
});
