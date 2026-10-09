import { version } from "axe-core";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { runTestCases } from "../runTestCases";
import { Assertion, Assertor } from "../../types";

describe("runTestCases cache", () => {
  const relativePath =
    "testcases/73f2c2/eabc191efa65e6613739042a0ae21937cda02428.html";
  const cached: Assertion = {
    "@type": "Assertion",
    mode: "earl:automatic",
    subject: {
      "@type": ["earl:TestSubject"],
      source: `https://example.com/${relativePath}`,
    },
    result: {
      "@type": "TestResult",
      outcome: "earl:passed",
    },
  };
  const assertor: Assertor = {
    "@id": `https://github.com/dequelabs/axe-core/releases/tag/${version}`,
    "@type": "Assertor",
    name: "axe-core",
    release: {
      "@type": "Version",
      revision: version,
    },
  };

  let outFile: string;

  beforeEach(() => {
    outFile = path.join(os.tmpdir(), `axe-cache-${process.pid}-${Date.now()}.json`);
    fs.writeFileSync(
      outFile,
      JSON.stringify({ "@graph": [assertor, cached] })
    );
  });

  afterEach(() => {
    delete require.cache[path.resolve(outFile)];
    fs.unlinkSync(outFile);
  });

  test("reuses cached assertions and ignores the assertor", async () => {
    const seen: string[] = [];
    const results = await runTestCases(
      {
        testCaseJson: "./src/__test-utils__/data/testcases.json",
        outFile,
      },
      async testcase => {
        seen.push(testcase.relativePath);
        return { "@context": {}, "@graph": [] };
      }
    );

    expect(seen).not.toContain(relativePath);
    expect(results).toEqual(
      expect.arrayContaining([{ "@graph": [cached] }])
    );
    expect(JSON.stringify(results)).not.toContain('"Assertor"');
  });
});
