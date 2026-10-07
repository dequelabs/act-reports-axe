import { expand, frame, NodeObject } from "jsonld";
import context from "../context";

const doap = "http://usefulinc.com/ns/doap#";
const earl = "http://www.w3.org/ns/earl#";
const dct = "http://purl.org/dc/terms/";

/**
 * Same shape as act-tools `findAssertor`: frame for earl:Assertor with DOAP
 * name, release, and revision.
 */
const assertorFrame = {
  "@context": {
    "@vocab": earl,
    earl,
    doap,
    name: "doap:name",
    release: "doap:release",
    revision: "doap:revision",
  },
  "@type": "earl:Assertor",
};

describe("EARL context", () => {
  const report = {
    "@context": context,
    "@graph": [
      {
        "@type": "Assertor",
        "@id": "https://github.com/dequelabs/axe-core/releases/tag/4.10.3",
        name: "axe-core",
        release: {
          "@type": "Version",
          revision: "4.10.3",
        },
      },
      {
        "@type": "Assertion",
        mode: "earl:automatic",
        assertedBy: "https://github.com/dequelabs/axe-core/releases/tag/4.10.3",
        subject: {
          "@type": ["earl:TestSubject", "sch:WebPage"],
          source: "https://example.com/page",
        },
        result: {
          "@type": "TestResult",
          outcome: "earl:passed",
        },
        test: {
          "@type": "TestCase",
          title: "rule-id",
          isPartOf: ["WCAG2:identify-input-purpose"],
        },
      },
    ],
  };

  test("frames the assertor name and version as DOAP", async () => {
    const framed = await frame(report, assertorFrame);
    const assertor = (
      "@graph" in framed ? (framed["@graph"] as NodeObject[])[0] : framed
    ) as NodeObject & {
      name?: string;
      release?: { revision?: string };
    };

    expect(assertor.name).toBe("axe-core");
    expect(assertor.release?.revision).toBe("4.10.3");
  });

  test("expands assertor name and release to DOAP and leaves assertion IRIs on EARL", async () => {
    const expanded = await expand(report);
    const assertor = expanded.find(node =>
      node["@type"]?.includes(`${earl}Assertor`)
    );
    const assertion = expanded.find(node =>
      node["@type"]?.includes(`${earl}Assertion`)
    );

    expect(assertor?.[`${doap}name`]).toEqual([{ "@value": "axe-core" }]);
    expect(assertor?.[`${doap}release`]).toEqual([
      {
        "@type": [`${doap}Version`],
        [`${doap}revision`]: [{ "@value": "4.10.3" }],
      },
    ]);

    expect(assertion?.[`${earl}mode`]).toEqual([{ "@id": `${earl}automatic` }]);
    expect(assertion?.[`${earl}assertedBy`]).toEqual([
      { "@id": "https://github.com/dequelabs/axe-core/releases/tag/4.10.3" },
    ]);
    expect(assertion?.[`${earl}result`]).toEqual([
      {
        "@type": [`${earl}TestResult`],
        [`${earl}outcome`]: [{ "@id": `${earl}passed` }],
      },
    ]);
    expect(assertion?.[`${earl}subject`]).toEqual([
      {
        "@type": [`${earl}TestSubject`, "https://schema.org/WebPage"],
        [`${dct}source`]: [{ "@value": "https://example.com/page" }],
      },
    ]);
    expect(assertion?.[`${earl}test`]).toEqual([
      {
        "@type": [`${earl}TestCase`],
        [`${dct}title`]: [{ "@value": "rule-id" }],
        [`${dct}isPartOf`]: [
          { "@id": "http://www.w3.org/TR/WCAG21/#identify-input-purpose" },
        ],
      },
    ]);
    expect(Object.keys(assertion ?? {}).some(key => key.startsWith(doap))).toBe(
      false
    );
  });
});
