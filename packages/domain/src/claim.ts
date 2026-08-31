import type { Evidence } from "./evidence.js";

export type ClaimStatus =
  | "supported"
  | "partially_supported"
  | "contradicted"
  | "insufficient_evidence";

export type ClaimOrigin =
  | "explicit"
  | "inferred";

export interface Claim {
  id: string;
  text: string;
  type?: ClaimType;
  origin: ClaimOrigin;
  importance: number;

  status?: ClaimStatus;

  evidence: Evidence[];
}

export type ClaimType =
  | "conclusion"
  | "assumption"
  | "prediction"
  | "fact";

export interface ClaimRelationship {
  from: string[];
  to: string;
  relationship:
    | "supports"
    | "contradicts"
    | "depends_on";
}