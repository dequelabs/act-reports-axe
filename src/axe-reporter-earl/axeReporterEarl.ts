import context from './context';
import { RawResult, Env, Assertion, EarlReport } from '../types';

export default function axeReporterEarl(
  ruleResults: RawResult[],
  env: Env
): EarlReport {
  const axeTypes = ["passes", "incomplete", "inapplicable", "violations"] as const;
  const outcomeMap = {
    passes: "passed",
    violations: "failed",
    incomplete: "cantTell"
  };

  const { url, version } = env;
  const graph: Assertion[] = [];
  ruleResults.forEach(ruleResult => {
    if (ruleResult.result === "inapplicable") {
      graph.push(
        earlAssertion({
          outcome: "inapplicable",
          ruleId: ruleResult.id,
          source: url,
          version
        })
      );
      return;
    }

    axeTypes.forEach(axeType => {
      ruleResult[axeType]?.forEach(() => {
        graph.push(
          earlAssertion({
            // @ts-ignore
            outcome: outcomeMap[axeType] || axeType,
            ruleId: ruleResult.id,
            source: url,
            version
          })
        );
      });
    });
  });

  return {
    "@context": context,
    "@graph": graph
  };
}

export function earlUntested({ url, version }: Env) {
  const untestedAssertion = earlAssertion({
    source: url,
    version
  });
  return {
    "@context": context,
    "@graph": [untestedAssertion]
  };
}

type AssertionArg = {
  source: string,
  version?: string,
  ruleId?: string
  mode?: string
  outcome?: string
}

export function earlAssertion({
  source,
  version,
  ruleId,
  mode = "automatic",
  outcome = "untested"
}: AssertionArg): Assertion {
  if (typeof source !== 'string') {
    throw new Error('Source must be defined')
  }
  const assertion: Assertion = {
    "@type": "Assertion",
    mode: `earl:${mode}`,
    subject: { "@type": ["earl:TestSubject", "sch:WebPage"], source },
    assertedBy: `https://github.com/dequelabs/axe-core/releases/tag/${version}`,
    result: {
      "@type": "TestResult",
      outcome: `earl:${outcome}`
    }
  };

  if (ruleId) {
    const minor = version?.match(/[0-9]+\.[0-9]+/)?.[0] || '4.4';
    assertion.test = {
      "@type": "TestCase",
      title: ruleId,
      "@id": `https://dequeuniversity.com/rules/axe/${minor}/${ruleId}?application=axeAPI`
    };
  }
  return assertion;
}

/**
 * Concat multiple assertions
 */
export function concatReport(testResults: EarlReport[]): EarlReport {
  // Flatten the graphs into a single array
  const graphs = testResults.reduce((graph: Assertion[], result: EarlReport) => {
    return graph.concat(result["@graph"]);
  }, []);

  return {
    "@context": context,
    "@graph": graphs
  };
}
