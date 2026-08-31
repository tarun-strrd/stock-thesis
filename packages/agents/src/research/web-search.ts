import OpenAI from "openai";
import type {
    ResearchQuery,
    ResearchResult,
} from "./types.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function searchWeb(
    query: ResearchQuery,
): Promise<ResearchResult[]> {
    const response = await client.responses.create({
        model: "gpt-5.6-luna",
        tools: [
            {
                type: "web_search",
            },
        ],
        input: `
Research the following question:

${query.query}

Company: ${query.company ?? "Not specified"}

Find relevant, reliable sources.
Prefer primary sources such as company filings,
investor presentations, earnings calls, regulatory
filings, and official company information.

Do not give an investment recommendation.
Find sources relevant to the question.
    `,
    });

    const results: ResearchResult[] = [];

    for (const item of response.output) {
        if (item.type !== "message") {
            continue;
        }

        for (const content of item.content) {
            if (content.type !== "output_text") {
                continue;
            }

            for (const annotation of content.annotations) {
                if (annotation.type !== "url_citation") {
                    continue;
                }

                results.push({
                    title: annotation.title,
                    url: annotation.url,
                });
            }
        }
    }

    const uniqueResults = Array.from(
        new Map(
            results.map((result) => [result.url, result]),
        ).values(),
    );

    return uniqueResults;
}

