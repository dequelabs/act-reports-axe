import { readFileSync } from "fs"
import * as path from "path"
import { AxePuppeteer } from "@axe-core/puppeteer";
import * as axe from 'axe-core';
import type { RunOptions } from 'axe-core'
import { EarlReport } from './types';

import axeReporterEarl, { earlUntested } from "./axe-reporter-earl/axeReporterEarl";
import {
  rulesAxeOptions,
  ignoreRulesIds,
  inapplicableFileExtensions,
  manualRulesMapping
} from "./config";
import { Page } from "puppeteer";
import { RawResult, TestCase, ToolRunner } from "./types";

const axeSource = readFileSync(require.resolve("axe-core"), "utf-8");

/**
 * Run axe-puppeteer in a given page, with a success criterion
 */
export const axeRunTestCase: ToolRunner = async (
  page: Page,
  testCase: TestCase
): Promise<EarlReport | void> => {
  const { url = "", ruleSuccessCriterion: tags = [], ruleId } = testCase;
  // check if running axe should be ignored
  const extn = getFileExtension(url);
  const env = { url, version: axe.version };

  if (ignoreRulesIds.includes(ruleId) || !tags.length) {
    return earlUntested(env);
  }

  const axeRulesIds = getAxeRuleIdsToRun(tags, ruleId);
  if (!axeRulesIds.length) {
    return earlUntested(env);
  }

  // Get the page and make sure it loads correctly
  await page.goto(url, { waitUntil: "networkidle0" });

  // if given page is of type `html`, ensure it loaded
  if (extn === `html`) {
    const html = await page.$eval<string>("html", e => e.outerHTML) as unknown as string;
    if (html.includes("Not Found")) {
      console.log(`Not Found ${url}`);
      return earlUntested(env);
    }
  }

  // return
  return Promise.race([
    analyze(), // Run axe to completion
    timeoutReject(50000, `Timeout for page ${url}`) // or, timeout after 5s
  ]);

  /* Run axe and return EARL */
  async function analyze(): Promise<EarlReport | void> {
    try {
      let raw: RawResult[]
      // check for inapplicable file extensions
      if (inapplicableFileExtensions.includes(extn)) {
        raw = axeRulesIds.map(ruleId => {
          return { result: `inapplicable`, id: ruleId };
        });
      } else {
        // Setup axe-puppeteer with the correct SC
        const options: RunOptions = {
          reporter: "raw",
          runOnly: {
            type: "rule",
            values: axeRulesIds
          },
          ...rulesAxeOptions[ruleId]
        };
        const axeRunner = new AxePuppeteer(page, axeSource)
        axeRunner.options(options)
        raw = (await axeRunner.analyze() as unknown as RawResult[])
      }
      return axeReporterEarl(raw, env);
    } catch (error) {
      console.error(error);
    }
  }
};

/* Reject with a message after a certain time */
function timeoutReject(t: number, msg: string): Promise<void> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(msg)), t);
  });
}

/**
 * Get extension from path
 */
function getFileExtension(str: string) {
  const filename = path.basename(str);
  const extn = path.extname(filename).slice(1);
  return extn || "";
}

/**
 * Get axe rules to run
 */
function getAxeRuleIdsToRun(tags: string[], ruleId: string): string[] {
  const axeRules = axe.getRules(tags);
  if (axeRules.length > 0) {
    return axeRules.map(axeRule => axeRule.ruleId);
  }

  return manualRulesMapping[ruleId] || [];
}
