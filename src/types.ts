import { Page } from 'puppeteer';

export type ToolRunner = (page: Page, testCase: TestCase) => Promise<EarlReport | void>

export type Config = {
  testCaseJson: string
  ruleId?: string
  outFile: string
}

export type PageRunner = () => Promise<void>

export type TestCase = {
  url: string,
  ruleSuccessCriterion: string[],
  ruleId: string,
  ruleName: string,
  remoteUrl: string
  relativePath: string
  ruleAccessibilityRequirements?: Record<string, string>
}

export type RawResult = {
  result: string
  id: string
  tags: string[]
  passes?: string[]
  incomplete?: string[]
  inapplicable?: string[]
  violations?: string[]
}

export type Env = {
  url: string
  version: string
}

export type Assertion = {
  "@type": "Assertion",
  mode: string,
  subject: {
    "@type": string[],
    source: string
  },
  assertedBy: string,
  result: {
    "@type": "TestResult",
    outcome: string
  }
  test?: {
    "@type": string,
    title: string,
    isPartOf?: string[]
    "@id": string
  };
}

export type EarlReport = {
  "@context": Object
  "@graph": Assertion[]
}
