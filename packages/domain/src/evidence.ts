export type EvidencePolarity =
  | "supports"
  | "contradicts"
  | "neutral";

export interface Evidence {
  id: string;

  statement: string;

source: {
  title: string;
  url: string;
  publishedAt?: string;
  tier: SourceTier;
};

  polarity: EvidencePolarity;

  confidence: number;
  sourceTier: SourceTier;
  retrievedAt: string;
  relevance: string;
}

export type SourceTier =
  | "primary"
  | "regulatory"
  | "secondary"
  | "tertiary";
