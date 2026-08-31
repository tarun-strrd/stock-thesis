import dotenv from "dotenv";
import path from "node:path";
import type { Claim } from "@thesis/domain";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const { createResearchPlan } =
  await import("./research/research-planner.js");

const claim: Claim = {
  id: "C3",
  text: "TCS's margins will recover over the next two years.",
  type: "prediction",
  origin: "explicit",
  importance: 0.9,
  evidence: [],
};

const plan = await createResearchPlan(
  claim,
  "TCS",
);

console.log("\nSUPPORTING QUERIES:");
console.log(plan.supportingQuery)
console.log("\nCHALLENGING QUERIES:");
console.log(plan.challengingQuery)