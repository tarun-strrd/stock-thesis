import dotenv from "dotenv";
import path from "node:path";
import type {
  Claim,
  ClaimRelationship,
} from "@thesis/domain";
import type { EvidenceJudgment } from "./evidence-judge.js";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const { judgeThesis } =
  await import("./thesis-judge.js");

const thesis =
  "TCS is undervalued because AI will not materially disrupt TCS's business and its margins will recover over the next two years.";

const claims: Claim[] = [
  {
    id: "C1",
    text: "TCS is undervalued.",
    type: "conclusion",
    origin: "explicit",
    importance: 1,
    evidence: [],
  },
  {
    id: "C2",
    text: "AI will not materially disrupt TCS's business.",
    type: "assumption",
    origin: "explicit",
    importance: 0.9,
    evidence: [],
  },
  {
    id: "C3",
    text: "TCS's margins will recover over the next two years.",
    type: "prediction",
    origin: "explicit",
    importance: 0.9,
    evidence: [],
  },
];

const judgments: Record<string, EvidenceJudgment> = {
  C1: {
    verdict: "insufficient_evidence",
    confidence: 0.9,
    reasoning:
      "No direct valuation evidence has yet established that TCS is undervalued.",
    keyEvidenceIds: [],
  },

  C2: {
    verdict: "partially_supported",
    confidence: 0.75,
    reasoning:
      "Evidence suggests AI is also being used by TCS as a source of productivity and transformation, but this does not establish that AI will not materially disrupt the business.",
    keyEvidenceIds: [],
  },

  C3: {
    verdict: "insufficient_evidence",
    confidence: 0.98,
    reasoning:
      "Current evidence establishes recent margins and management profitability objectives but does not establish two-year margin recovery.",
    keyEvidenceIds: [
      "C3-evidence-1",
      "C3-evidence-2",
      "C3-evidence-3",
    ],
  },
};

const relationships: ClaimRelationship[] = [
  {
    from: ["C2"],
    to: "C1",
    relationship: "supports",
  },
  {
    from: ["C3"],
    to: "C1",
    relationship: "supports",
  },
];

const judgment = await judgeThesis(
  thesis,
  claims,
  judgments,
  relationships,
);

console.log("\nTHESIS:");
console.log(thesis);

console.log("\nVERDICT:");
console.log(judgment.verdict);

console.log("\nCONFIDENCE:");
console.log(judgment.confidence);

console.log("\nREASONING:");
console.log(judgment.reasoning);

console.log("\nKEY CLAIMS:");
console.log(judgment.keyClaimIds);