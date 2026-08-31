import OpenAI from "openai";
import type { Claim, ClaimRelationship } from "@thesis/domain";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface DecompositionResult {
    claims: Array<{
        id: string;
        text: string;
        type: "conclusion" | "assumption" | "prediction" | "fact";
        importance: number;
    }>;

    relationships: Array<{
        from: string[];
        to: string;
        relationship:
        | "supports"
        | "contradicts"
        | "depends_on";
    }>;
}

export interface ThesisDecomposition {
    claims: Claim[];
    relationships: ClaimRelationship[];
}

export async function decomposeThesis(
    company: string,
    thesis: string,
): Promise<ThesisDecomposition> {
    const response = await client.responses.create({
        model: "gpt-5-mini",
        input: [
            {
                role: "system",
                content: `You are an investment thesis decomposition agent.

Your task is to transform an investor's thesis into a small
set of atomic, independently testable claims and the logical
relationships between those claims.

IMPORTANT:

A thesis may contain:
- conclusions
- assumptions
- predictions
- facts
- logical relationships between them

Extract the claims separately from their relationships.

Rules:

1. Preserve the investor's intended meaning.
2. Extract only claims actually expressed or directly implied
   by the thesis.
3. Do not introduce new hypotheses or assumptions.
4. Each claim must be independently testable using evidence.
5. Separate a conclusion from the assumptions supporting it.
6. Never turn a logical relationship into another claim.
7. Do not create conditional claims such as:
   "If A and B happen, then C will happen."
   Instead create A, B and C as separate claims and represent
   the relationship separately.
8. Avoid redundant claims.
9. Do not research the company.
10. Do not provide investment advice.
11. Produce between 1 and 8 claims.
12. Assign each claim an importance score from 0 to 1.
13. 1 means the thesis depends heavily on the claim.
14. Only create relationships between claims that are
    logically connected in the original thesis.

Claim types:

conclusion:
The main outcome the investor believes.

assumption:
A condition the investor relies upon.

prediction:
Something the investor expects to happen in the future.

fact:
A factual statement explicitly asserted by the investor.`
            },
            {
                role: "user",
                content: `Company: ${company}\n\nInvestment thesis: ${thesis}`,
            },
        ],
        text: {
            format: {
                type: "json_schema",
                name: "thesis_decomposition",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        claims: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string",
                                    },
                                    text: {
                                        type: "string",
                                    },
                                    type: {
                                        type: "string",
                                        enum: [
                                            "conclusion",
                                            "assumption",
                                            "prediction",
                                            "fact",
                                        ],
                                    },
                                    importance: {
                                        type: "number",
                                    },
                                },
                                required: [
                                    "id",
                                    "text",
                                    "type",
                                    "importance",
                                ],
                                additionalProperties: false,
                            },
                        },

                        relationships: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    from: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                        },
                                    },
                                    to: {
                                        type: "string",
                                    },
                                    relationship: {
                                        type: "string",
                                        enum: [
                                            "supports",
                                            "contradicts",
                                            "depends_on",
                                        ],
                                    },
                                },
                                required: [
                                    "from",
                                    "to",
                                    "relationship",
                                ],
                                additionalProperties: false,
                            },
                        },
                    },

                    required: [
                        "claims",
                        "relationships",
                    ],

                    additionalProperties: false,
                }
            },
        },
    });

    const result = JSON.parse(
        response.output_text,
    ) as DecompositionResult;

    return {
        claims: result.claims.map((claim) => ({
            id: claim.id,
            text: claim.text,
            type: claim.type,
            origin: "explicit",
            importance: claim.importance,
            evidence: [],
        })),
        relationships: result.relationships,
    };
}