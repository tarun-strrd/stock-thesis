import OpenAI from "openai";
import type { Claim, Evidence } from "@thesis/domain";
import type { SourceDocument } from "./research/types.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractionResult {
    evidence: Array<{
        statement: string;
        polarity: "supports" | "contradicts" | "neutral";
        confidence: number;
        relevance: string;
    }>;
}

export async function extractEvidence(
    claim: Claim,
    source: SourceDocument,
): Promise<Evidence[]> {
    const response = await client.responses.create({
        model: "gpt-5.6-luna",

        input: `
You are an evidence extraction agent for an investment
thesis research system.

Your job is to extract evidence from a source that is
relevant to ONE specific claim.

CLAIM:
${claim.text}

SOURCE TITLE:
${source.title}

SOURCE URL:
${source.url}

SOURCE CONTENT:
${source.content}

Rules:

1. Use ONLY information contained in the source.
2. Do not use outside knowledge.
3. Do not invent facts.
4. Do not make an investment recommendation.
5. Extract concrete factual statements.
6. An evidence item must be relevant to the claim.
7. Evidence can:
   - support the claim
   - contradict the claim
   - be neutral/contextual
8. Only label evidence as "supports" when the source provides
   direct or reasonably strong evidence for the claim.
9. Do NOT label evidence as supporting merely because it describes
   a factor that could theoretically contribute to the claim.
10. Do NOT convert speculation, possibility, management aspirations,
    or indirect causal reasoning into supporting evidence.
11. If a source says something "could", "may", "might", or describes
    an initiative without demonstrating its effect on the claim,
    prefer "neutral" unless the source explicitly connects it to
    the claim.
12. Do not force evidence into "supports" or "contradicts".
13. If the source contains no meaningful evidence for the claim,
    return an empty array.
14. Keep each evidence statement concise.
15. Confidence must be between 0 and 1.
16. Confidence represents how confidently the source supports
    the extracted evidence statement, NOT whether the claim
    itself is true.
`,

        text: {
            format: {
                type: "json_schema",
                name: "evidence_extraction",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        evidence: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    statement: {
                                        type: "string",
                                    },
                                    polarity: {
                                        type: "string",
                                        enum: [
                                            "supports",
                                            "contradicts",
                                            "neutral",
                                        ],
                                    },
                                    confidence: {
                                        type: "number",
                                    },
                                    relevance: {
                                        type: "string",
                                    },
                                },
                                required: [
                                    "statement",
                                    "polarity",
                                    "confidence",
                                    "relevance",
                                ],
                                additionalProperties: false,
                            },
                        },
                    },
                    required: ["evidence"],
                    additionalProperties: false,
                },
            },
        },
    });

    const result = JSON.parse(
        response.output_text,
    ) as ExtractionResult;

    return result.evidence.map((item, index) => ({
        id: `${claim.id}-evidence-${index + 1}`,

        statement: item.statement,

        polarity: item.polarity,

        confidence: item.confidence,
        relevance: item.relevance,

        source: {
            title: source.title,
            url: source.url,
            publishedAt: source.publishedAt,
            tier: "primary",
        },
        sourceTier: "primary",
        retrievedAt: new Date().toISOString(),
    }));
}