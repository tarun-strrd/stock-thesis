import dotenv from "dotenv";
import path from "node:path";
import type { Claim, Evidence } from "@thesis/domain";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const { judgeClaim } =
  await import("./evidence-judge.js");

const claim: Claim = {
  id: "C3",
  text: "TCS's margins will recover over the next two years.",
  type: "prediction",
  origin: "explicit",
  importance: 0.9,
  evidence: [],
};

const evidence: Evidence[] = [
  {
    id: "C3-evidence-1",
    statement:
      "TCS reported a Q1 FY27 operating margin of 24.0%, excluding exceptional items.",
    relevance:
      "Provides the current margin baseline but does not establish future recovery.",
    polarity: "neutral",
    confidence: 1,
    source: {
      title: "TCS Q1 FY27 Results",
      url: "https://www.tcs.com/who-we-are/newsroom/press-release/tcs-financial-results-q1-fy-2027",
      tier: "primary",
    },
    retrievedAt: new Date().toISOString(),
    sourceTier: "primary"
  },

  {
    id: "C3-evidence-2",
    statement:
      "Management said TCS would maintain disciplined execution, industry-leading profitability, and return ratios while making targeted investments and rolling out annual wage hikes.",
    relevance:
      "Describes management's profitability objective but does not provide a forecast of margin recovery.",
    polarity: "neutral",
    confidence: 0.96,
    source: {
      title: "TCS Q1 FY27 Results",
      url: "https://www.tcs.com/who-we-are/newsroom/press-release/tcs-financial-results-q1-fy-2027",
      tier: "primary",
    },
    retrievedAt: new Date().toISOString(),
    sourceTier:"primary"
  },

  {
    id: "C3-evidence-3",
    statement:
      "Operating income declined from US$1,927 million in Q4 FY26 to US$1,826 million in Q1 FY27 while revenue remained broadly flat.",
    relevance:
      "Shows recent margin pressure but does not establish the two-year outlook.",
    polarity: "neutral",
    confidence: 0.99,
    source: {
      title: "TCS Q1 FY27 Results",
      url: "https://www.tcs.com/who-we-are/newsroom/press-release/tcs-financial-results-q1-fy-2027",
      tier: "primary",
    },
    retrievedAt: new Date().toISOString(),
    sourceTier: "primary"
  },
];

const judgment = await judgeClaim(
  claim,
  evidence,
);

console.log("\nCLAIM:");
console.log(claim.text);

console.log("\nVERDICT:");
console.log(judgment.verdict);

console.log("\nCONFIDENCE:");
console.log(judgment.confidence);

console.log("\nREASONING:");
console.log(judgment.reasoning);

console.log("\nKEY EVIDENCE:");
console.log(judgment.keyEvidenceIds);