import type {
  Claim,
  ClaimRelationship,
} from "@thesis/domain";

import { decomposeThesis } from "./thesis-decomposer.js";
import { searchWeb } from "./research/web-search.js";
import { readSource } from "./research/source-reader.js";
import { extractEvidence } from "./evidence-extractor.js";
import {
  judgeClaim,
  type EvidenceJudgment,
} from "./evidence-judge.js";
import {
  judgeThesis,
  type ThesisJudgment,
} from "./thesis-judge.js";

export interface ClaimAnalysis {
  claim: Claim;
  evidence: Awaited<ReturnType<typeof extractEvidence>>;
  judgment: EvidenceJudgment;
}

export interface ThesisAnalysis {
  thesis: string;
  claims: Claim[];
  relationships: ClaimRelationship[];
  claimAnalyses: ClaimAnalysis[];
  judgment: ThesisJudgment;
}

export async function analyzeThesis(
  thesis: string,
  company: string,
): Promise<ThesisAnalysis> {
  console.log("\n=== DECOMPOSING THESIS ===");

  const decomposition = await decomposeThesis(thesis, company)


  const claims = decomposition.claims;
  const relationships = decomposition.relationships;

  console.log(
    `Found ${claims.length} claims.`,
  );

  const claimAnalyses: ClaimAnalysis[] = [];
  const claimsToAnalyze = claims.slice(0, 1);

  for (const claim of claims) {
    console.log("\n================================");
    console.log(`CLAIM ${claim.id}: ${claim.text}`);
    console.log("================================");

    /*
     * Skip low-importance claims for now.
     * This keeps the hackathon demo fast and inexpensive.
     */
    if (claim.importance < 0.5) {
      console.log("Skipping low-importance claim.");
      continue;
    }

    const query =
      `${company} ${claim.text} evidence`;

    console.log("\nSearching...");

    const sources = await searchWeb({
      query,
      company,
      claimId: claim.id,
    });

    console.log(
      `Found ${sources.length} sources.`,
    );

    const evidence = [];

    /*
     * Limit sources for the MVP.
     * We can expand this later.
     */
    for (const source of sources.slice(0, 3)) {
      try {
        console.log(
          `Reading: ${source.title}`,
        );

        const document = await readSource(source);

        const extracted =
          await extractEvidence(
            claim,
            document,
          );

        evidence.push(...extracted);
      } catch (error) {
        console.warn(
          `Could not process source: ${source.url}`,
        );
      }
    }

    console.log(
      `Extracted ${evidence.length} evidence items.`,
    );

    const judgment = await judgeClaim(
      claim,
      evidence,
    );

    console.log(
      `Claim verdict: ${judgment.verdict}`,
    );

    claimAnalyses.push({
      claim,
      evidence,
      judgment,
    });
  }

  /*
   * Convert claim judgments into the structure
   * expected by the Thesis Judge.
   */
  const judgments: Record<
    string,
    EvidenceJudgment
  > = {};

  for (const analysis of claimAnalyses) {
    judgments[analysis.claim.id] =
      analysis.judgment;
  }

  console.log("\n=== JUDGING THESIS ===");

  const judgment = await judgeThesis(
    thesis,
    claims,
    judgments,
    relationships,
  );

  return {
    thesis,
    claims,
    relationships,
    claimAnalyses,
    judgment,
  };
}