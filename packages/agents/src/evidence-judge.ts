import OpenAI from "openai";
import type { Claim, Evidence } from "@thesis/domain";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ClaimVerdict =
  | "supported"
  | "partially_supported"
  | "contradicted"
  | "insufficient_evidence";

export interface EvidenceJudgment {
  verdict: ClaimVerdict;
  confidence: number;
  reasoning: string;
  keyEvidenceIds: string[];
}

interface JudgeResult {
  verdict: ClaimVerdict;
  confidence: number;
  reasoning: string;
  keyEvidenceIds: string[];
}

export async function judgeClaim(
  claim: Claim,
  evidence: Evidence[],
): Promise<EvidenceJudgment> {
  const evidenceText = evidence
    .map(
      (item) => `
EVIDENCE ID: ${item.id}
STATEMENT: ${item.statement}
RELEVANCE: ${item.relevance}
POLARITY: ${item.polarity}
CONFIDENCE: ${item.confidence}
SOURCE: ${item.source.title}
SOURCE TIER: ${item.source.tier}
SOURCE URL: ${item.source.url}
`,
    )
    .join("\n");

  const response = await client.responses.create({
    model: "gpt-5.6-luna",

    input: `
You are the evidence judge in an investment thesis
verification system.

Determine whether the available evidence supports
the following claim.

CLAIM:
${claim.text}

EVIDENCE:
${evidenceText || "No evidence available."}

VERDICTS:

supported:
The evidence provides strong, direct support for the claim.

partially_supported:
Some important parts of the claim are supported, but
the evidence is incomplete, conditional, mixed, or does
not establish the entire claim.

contradicted:
The strongest relevant evidence indicates that the claim
is false or unlikely.

insufficient_evidence:
The available evidence does not establish whether the
claim is true or false.

RULES:

1. Judge ONLY from the supplied evidence.
2. Do not use outside knowledge.
3. Do not make an investment recommendation.
4. Do not treat management aspirations as proof.
5. Do not treat a current metric as proof of a future prediction.
6. Prefer direct evidence over indirect inference.
7. Give greater weight to higher-quality sources.
8. Conflicting evidence should be explicitly discussed.
9. If an important part of the claim has no evidence,
   consider insufficient_evidence or partially_supported.
10. Do not force a verdict when evidence is weak.
11. keyEvidenceIds should contain the most important evidence
    used to reach the verdict.
`,
    text: {
      format: {
        type: "json_schema",
        name: "evidence_judgment",
        strict: true,
        schema: {
          type: "object",
          properties: {
            verdict: {
              type: "string",
              enum: [
                "supported",
                "partially_supported",
                "contradicted",
                "insufficient_evidence",
              ],
            },
            confidence: {
              type: "number",
            },
            reasoning: {
              type: "string",
            },
            keyEvidenceIds: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: [
            "verdict",
            "confidence",
            "reasoning",
            "keyEvidenceIds",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(
    response.output_text,
  ) as JudgeResult;
}