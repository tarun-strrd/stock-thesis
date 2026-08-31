import type { Claim, ClaimRelationship } from "./claim.js";

export type ThesisVerdict =
  | "supported"
  | "partially_supported"
  | "contradicted"
  | "inconclusive";

export interface Thesis {
  id: string;

  company: {
    name: string;
    ticker: string;
  };

  statement: string;

  claims: Claim[];

  relationships: ClaimRelationship[];

  verdict?: ThesisVerdict;

  confidence?: number;

  createdAt: string;
}