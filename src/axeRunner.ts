import { ensureFile, writeJson } from 'fs-extra';
import * as path from 'path';
import { axeRunTestCase } from './axeRunTestCase';
import { runTestsInPage, startPuppeteer, stopPuppeteer } from './act-runner/runTestsInPage';
import { Config } from './types';
import { testCaseJson } from '../package.json';

const config: Config = {
  outFile: './reports/axe-core.json',
  testCaseJson
}

async function main() {
  const { page, browser } = await startPuppeteer();

  try {
    const earlResults = await runTestsInPage(page, config, axeRunTestCase);
    const filepath = path.resolve(config.outFile);
    await ensureFile(filepath);
    await writeJson(filepath, earlResults, { spaces: 2 });

    console.log(`Created axe-core implementation report at "${config.outFile}"`);
  } finally {
    await stopPuppeteer(page, browser);
  }
}

main()
  .then(() => {
    console.log("Axe report generated for ACT Rules.");
    process.exit();
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
