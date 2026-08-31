import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const { analyzeThesis } =
  await import("./thesis-analyzer.js");

const thesis =
  "TCS is undervalued because AI will not materially disrupt TCS's business and its margins will recover over the next two years.";

console.log("\nSTARTING THESIS ANALYSIS...\n");

const result = await analyzeThesis(
  thesis,
  "TCS",
);

console.log("\n\n==============================");
console.log("FINAL THESIS VERDICT");
console.log("==============================");

console.log(
  "\nVerdict:",
  result.judgment.verdict,
);

console.log(
  "Confidence:",
  result.judgment.confidence,
);

console.log(
  "\nReasoning:",
  result.judgment.reasoning,
);

console.log("\n\nCLAIM RESULTS");

for (const analysis of result.claimAnalyses) {
  console.log("\n------------------------------");

  console.log(
    analysis.claim.id,
    analysis.claim.text,
  );

  console.log(
    "Verdict:",
    analysis.judgment.verdict,
  );

  console.log(
    "Confidence:",
    analysis.judgment.confidence,
  );

  console.log(
    "Evidence:",
    analysis.evidence.length,
  );
}