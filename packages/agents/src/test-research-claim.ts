import dotenv from "dotenv";
import path from "node:path";
import type { Claim } from "@thesis/domain";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const { researchClaim } =
  await import("./research/research-claim.js");

const claim: Claim = {
  id: "C3",
  text: "TCS's margins will recover over the next two years.",
  type: "prediction",
  origin: "explicit",
  importance: 0.9,
  evidence: [],
};

const result = await researchClaim(
  claim,
  "TCS",
);

console.log("\nSUPPORTING SOURCES:");

for (const source of result.supporting) {
  console.log("\n-", source.title);
  console.log(" ", source.url);
}

console.log("\nCHALLENGING SOURCES:");

for (const source of result.challenging) {
  console.log("\n-", source.title);
  console.log(" ", source.url);
}