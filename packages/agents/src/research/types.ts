export interface ResearchResult {
  title: string;
  url: string;
  snippet?: string;
  publishedAt?: string;
}

export interface ResearchQuery {
  query: string;
  company?: string;
  claimId?: string;
}

export interface SourceDocument {
  title: string;
  url: string;
  content: string;
  publishedAt?: string;
}