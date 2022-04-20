import axeReporterEarl, { earlUntested, concatReport } from "../axeReporterEarl";
import context from '../context';
import raw from '../../__test-utils__/data/raw-results-73f2c2.json';
import { Env, RawResult } from "../../types";
import 'jest-extended';

const rawResults = raw as unknown as RawResult[][]

describe(`axe-reporter-earl`, () => {
  describe(`axeReporterEarl fn`, () => {
    test(`get report with empty "@graph"`, () => {
      const env = { url: '', version: '1.1.1' }
      const actual = axeReporterEarl([], env);
      expect(actual).toContainAllKeys(["@context", "@graph"]);
      
      expect(actual["@context"]).toBeObject();
      expect(
        JSON.stringify(actual["@context"]) === JSON.stringify(context)
      ).toBe(true);

      expect(actual["@graph"].length).toBe(0);
    });

    it('reports on success criteria', () => {
      const env = { version: '4.1.2', url: 'foo' }
      const report = axeReporterEarl(rawResults[0], env);
      for (const assertion of report["@graph"]) {
        expect(assertion.test?.isPartOf).toEqual(['WCAG2:identify-input-purpose'])
      }
    })

    test.each(rawResults)(
      `assert "@graph" EARL results for  given rule raw results, %p`,
      rawResult => {
        const env = {
          version: '100.200.999',
          url: 'foo'
        }
        const actual = axeReporterEarl([rawResult], env);
        expect(actual).toContainAllKeys(["@context", "@graph"]);
        expect(actual["@context"]).toBeObject();
        expect(JSON.stringify(actual["@context"])).toEqual(
          JSON.stringify(context)
        );

        expect(actual["@graph"].length).toBe(1);

        const assertion = actual["@graph"][0];
        expect(assertion).toContainAllKeys([
          "@type",
          "mode",
          "subject",
          "assertedBy",
          "result",
          "test"
        ]);
        expect(assertion["@type"]).toBe("Assertion");
        expect(assertion["mode"]).toBeOneOf([
          "earl:automatic" // note: can be extended later
        ]);
        
        expect(assertion.assertedBy).toEndWith(`${env.version}`);
        expect(assertion.result.outcome).toBe(`earl:${rawResult.result}`);
      }
    );
  });

  describe(`earlUntested fn`, () => {
    test(`get assertion of untested testcase`, () => {
      const env = { url: "http://idonot.exist", version: "100.200.999" };
      const actual = earlUntested(env);
      expect(actual).toContainAllKeys(["@context", "@graph"]);
      expect(actual["@context"]).toBeObject();
      expect(JSON.stringify(actual["@context"])).toEqual(
        JSON.stringify(context)
      );

      expect(actual["@graph"].length).toBe(1);

      const assertion = actual["@graph"][0];
      expect(assertion).toContainAllKeys([
        "@type",
        "mode",
        "subject",
        "assertedBy",
        "result"
      ]);
      expect(assertion["@type"]).toBe("Assertion");
      expect(assertion["mode"]).toBeOneOf([
        "earl:automatic" // note: can be extended later
      ]);

      expect(assertion.assertedBy).toEndWith(`${env.version}`);
      expect(assertion.result.outcome).toBe(`earl:untested`);
    });
  });

  describe(`concatReport fn`, () => {
    test(`get concatanated report`, () => {
      const env: Env = { version: "100.200.999", url: '' };
      const result1 = axeReporterEarl(rawResults[0], env);
      const result2 = axeReporterEarl(rawResults[1], env);

      const report = [result1, result2];
      const actual = concatReport(report);

      expect(actual["@graph"].length).toBe(2);
      expect(JSON.stringify(actual["@context"])).toEqual(
        JSON.stringify(context)
      );

      expect(JSON.stringify(actual["@graph"][0])).toEqual(
        JSON.stringify(result1["@graph"][0])
      );
      expect(JSON.stringify(actual["@graph"][1])).toEqual(
        JSON.stringify(result2["@graph"][0])
      );
    });
  });
});
