import OpenAI from "openai";
import type { Claim, ClaimRelationship } from "@thesis/domain";
import type { EvidenceJudgment } from "./evidence-judge.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ThesisVerdict =
  | "supported"
  | "partially_supported"
  | "contradicted"
  | "insufficient_evidence";

export interface ThesisJudgment {
  verdict: ThesisVerdict;
  confidence: number;
  reasoning: string;
  keyClaimIds: string[];
}

interface ThesisJudgeResult {
  verdict: ThesisVerdict;
  confidence: number;
  reasoning: string;
  keyClaimIds: string[];
}

export async function judgeThesis(
  thesis: string,
  claims: Claim[],
  judgments: Record<string, EvidenceJudgment>,
  relationships: ClaimRelationship[],
): Promise<ThesisJudgment> {
  const claimText = claims
    .map((claim) => {
      const judgment = judgments[claim.id];

      return `
CLAIM ID: ${claim.id}
CLAIM: ${claim.text}
TYPE: ${claim.type}
ORIGIN: ${claim.origin}
IMPORTANCE: ${claim.importance}

VERDICT: ${judgment?.verdict ?? "unknown"}
CONFIDENCE: ${judgment?.confidence ?? 0}
REASONING: ${judgment?.reasoning ?? "No judgment available."}
`;
    })
    .join("\n");

  const relationshipText = relationships
  .map(
    (relationship) =>
      `${relationship.from.join(", ")} --${relationship.relationship}--> ${relationship.to}`,
  )
  .join("\n");

  const response = await client.responses.create({
    model: "gpt-5.6-luna",

    input: `
You are the final thesis judge in an investment thesis
verification system.

ORIGINAL THESIS:
${thesis}

CLAIM JUDGMENTS:
${claimText}

CLAIM RELATIONSHIPS:
${relationshipText || "No relationships provided."}

Your task is to determine how well the original thesis
survives the claim-level evidence.

VERDICTS:

supported:
The important claims supporting the thesis are sufficiently
supported and there are no major unresolved contradictions.

partially_supported:
Some important claims are supported, but one or more important
claims remain uncertain, weakly supported, or mixed.

contradicted:
One or more important claims are directly contradicted by
strong evidence and this materially damages the thesis.

insufficient_evidence:
There is not enough evidence to determine whether the thesis
is supported or contradicted.

RULES:

1. Judge the original thesis, not whether the stock is a good investment.
2. Do not use outside knowledge.
3. Respect claim importance.
4. Pay attention to claim relationships.
5. A conclusion cannot be considered established merely because
   its underlying assumptions are plausible.
6. An important unsupported claim should materially weaken the
   overall thesis.
7. Do not treat uncertainty as contradiction.
8. Do not treat a single weak claim as enough to reject the entire
   thesis if it is not important.
9. Explain which claims matter most to the final verdict.
10. Do not make an investment recommendation.
`,
    text: {
      format: {
        type: "json_schema",
        name: "thesis_judgment",
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
            keyClaimIds: {
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
            "keyClaimIds",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(
    response.output_text,
  ) as ThesisJudgeResult;
}