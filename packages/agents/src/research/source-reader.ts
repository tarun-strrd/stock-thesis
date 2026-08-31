import type {
  ResearchResult,
  SourceDocument,
} from "./types.js";

export async function readSource(
  source: ResearchResult,
): Promise<SourceDocument> {
  const response = await fetch(source.url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${source.url}: ${response.status}`,
    );
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (contentType.includes("application/pdf")) {
    throw new Error(
      `PDF sources are not supported yet: ${source.url}`,
    );
  }

  const content = await response.text();

  return {
    title: source.title,
    url: source.url,
    content,
    publishedAt: source.publishedAt,
  };
}