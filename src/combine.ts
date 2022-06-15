import { readFileSync, writeFileSync } from 'fs';
import { EarlReport } from './types';

const axeJson = readFileSync('./reports/axe-core.json', 'utf8')
const coreReport = JSON.parse(axeJson) as EarlReport
const igtJson = readFileSync('./reports/axe-devtools-igt.json', 'utf8')
const igtReport = JSON.parse(igtJson);

coreReport['@graph'].forEach(assertion => delete assertion.assertedBy);
igtReport.assertedThat.push(...coreReport['@graph']);
const devtoolsReport = JSON.stringify(igtReport, null, 2);
writeFileSync('./reports/axe-devtools-combined.json', devtoolsReport, 'utf8');
