import dotenv from "dotenv";
import path from "node:path";
import type { Claim } from "@thesis/domain";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const { readSource } =
  await import("./research/source-reader.js");

const { extractEvidence } =
  await import("./evidence-extractor.js");

const source = await readSource({
  title: "TCS Q1 FY27 Results",
  url: "https://www.tcs.com/who-we-are/newsroom/press-release/tcs-financial-results-q1-fy-2027",
});

const claim: Claim = {
  id: "C3",
  text: "TCS's margins will recover over the next two years.",
  type: "prediction",
  origin: "explicit",
  importance: 0.9,
  evidence: [],
};

const evidence = await extractEvidence(
  claim,
  source,
);

console.log("\nCLAIM:");
console.log(claim.text);

console.log("\nEVIDENCE:");

for (const item of evidence) {
  console.log("\n---");

  console.log("Statement:", item.statement);
  console.log("Polarity:", item.polarity);
  console.log("Confidence:", item.confidence);
  console.log("Relevance:", item.relevance);

  console.log("Source:", item.source.title);
  console.log("URL:", item.source.url);
}