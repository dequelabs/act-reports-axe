import { PageRunner, runRuleTests } from "../runRuleTests";
import { axeRunTestCase } from "../../axeRunTestCase";
import { setup } from "../../__test-utils__/utils";
import { TestCase } from "../../types";
import { Page } from "puppeteer";

describe(`run-rule-tests`, () => {
  let testCases: TestCase[];
  let page: Page;
  let teardown: () => Promise<void>;

  const pageRunner: PageRunner = async (args) => {
    axeRunTestCase(page, args);
  }

  beforeAll(async () => {
    const setupOut = await setup();
    page = setupOut.page;
    testCases = setupOut.testCases;
    teardown = setupOut.teardown;
  });

  afterAll(async () => {
    await teardown();
  });

  test(`returns "undefined" when given test does not have "ruleAccessibilityRequirements"`, async () => {
    const [testCase] = testCases;
    const chosenTest = {
      ...testCase,
      ruleAccessibilityRequirements: undefined
    };
    const results = await runRuleTests(pageRunner, [chosenTest]);
    expect(results).toBeUndefined();
  });
});
