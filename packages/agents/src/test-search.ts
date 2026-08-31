import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const { searchWeb } = await import("./research/web-search.js");

const results = await searchWeb({
  query: "TCS operating margin Q1 FY27",
  company: "TCS",
  claimId: "C3",
});

console.log("\nRESULTS:");

for (const result of results) {
  console.log("\nTitle:", result.title);
  console.log("URL:", result.url);
}