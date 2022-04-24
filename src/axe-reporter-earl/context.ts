export default {
  "@vocab": "http://www.w3.org/ns/earl#",
  earl: "http://www.w3.org/ns/earl#",
  WCAG2: "http://www.w3.org/TR/WCAG21/#",
  dct: "http://purl.org/dc/terms/",
  sch: "https://schema.org/",
  source: "dct:source",
  title: "dct:title",
  assertedBy: { "@type": "@id" },
  outcome: { "@type": "@id" },
  mode: { "@type": "@id" },
  isPartOf: {
    "@id": "http://purl.org/dc/terms/isPartOf",
    "@type": "@id"
  }
};
