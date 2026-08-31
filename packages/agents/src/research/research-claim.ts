import type { Claim } from "@thesis/domain";
import { searchWeb } from "./web-search.js";
import type { ResearchResult } from "./types.js";

export interface ClaimResearch {
  supporting: ResearchResult[];
  challenging: ResearchResult[];
}

export async function researchClaim(
  claim: Claim,
  company: string,
): Promise<ClaimResearch> {
  console.log("\nResearching claim:");
  console.log(claim.text);

  const supportingQuery =
    `${company} ${claim.text} evidence supporting`;

  console.log("\nSupporting query:");
  console.log(supportingQuery);

  const supporting = await searchWeb({
    query: supportingQuery,
    company,
    claimId: claim.id,
  });

  console.log(
    `Supporting sources: ${supporting.length}`,
  );

  const challengingQuery =
    `${company} ${claim.text} risks challenges evidence against`;

  console.log("\nChallenging query:");
  console.log(challengingQuery);

  const challenging = await searchWeb({
    query: challengingQuery,
    company,
    claimId: claim.id,
  });

  console.log(
    `Challenging sources: ${challenging.length}`,
  );

  return {
    supporting: deduplicate(supporting),
    challenging: deduplicate(challenging),
  };
}

function deduplicate(
  results: ResearchResult[],
): ResearchResult[] {
  return Array.from(
    new Map(
      results.map((result) => [
        result.url,
        result,
      ]),
    ).values(),
  );
}