import OpenAI from "openai";
import type { Claim } from "@thesis/domain";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ResearchPlan {
    supportingQuery: string;
    challengingQuery: string;
}

interface ResearchPlanResult {
    supportingQuery: string;
    challengingQuery: string;
}

export async function createResearchPlan(
    claim: Claim,
    company: string,
): Promise<ResearchPlan> {
    const response = await client.responses.create({
        model: "gpt-5.6-luna",

        input: `
You are a research planning agent for an investment
thesis verification system.

Your job is to create research questions for ONE claim.

COMPANY:
${company}

CLAIM:
${claim.text}

CLAIM TYPE:
${claim.type}

Create two sets of search queries.

SUPPORTING QUERIES:
Queries that could find credible evidence supporting
the claim.

CHALLENGING QUERIES:
Queries that could find credible evidence contradicting
or weakening the claim.

Rules:

1. Do not decide whether the claim is true.
2. Do not provide an investment recommendation.
3. Queries must seek evidence, not opinions.
4. Prefer specific, factual queries.
5. Consider the time period in the claim.
6. For predictions, search for both the expected drivers
   and factors that could prevent the prediction.
7. For assumptions, search for evidence that the assumption
   may be false.
8. For conclusions, search for evidence that could invalidate
   the conclusion.
9. Generate 2-4 queries in each direction.
10. Avoid duplicate queries.
`,

        text: {
            format: {
                type: "json_schema",
                name: "research_plan",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        supportingQuery: {
                            type: "string",
                        },
                        challengingQuery: {
                            type: "string",
                        },
                    },
                    required: [
                        "supportingQuery",
                        "challengingQuery",
                    ],
                    additionalProperties: false,
                },
            },
        },
    });

    return JSON.parse(
        response.output_text,
    ) as ResearchPlanResult;
}