import { readFileSync, writeFileSync } from 'fs';
import { Assertion, Assertor, EarlReport } from './types';

const axeJson = readFileSync('./reports/axe-core.json', 'utf8')
const coreReport = JSON.parse(axeJson) as EarlReport<Assertion | Assertor>
const igtJson = readFileSync('./reports/axe-devtools-igt.json', 'utf8')
const igtReport = JSON.parse(igtJson);

const assertions = coreReport['@graph'].filter(
  (node): node is Assertion => node['@type'] === 'Assertion'
);
assertions.forEach(assertion => delete assertion.assertedBy);
igtReport.assertedThat.push(...assertions);
const devtoolsReport = JSON.stringify(igtReport, null, 2);
writeFileSync('./reports/axe-devtools-combined.json', devtoolsReport, 'utf8');
