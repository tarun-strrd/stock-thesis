import dotenv from "dotenv";
import path from "node:path";

const envPath = path.resolve(process.cwd(), "../../.env");

console.log("CWD:", process.cwd());
console.log("ENV PATH:", envPath);

const result = dotenv.config({
  path: envPath,
});

console.log("DOTENV ERROR:", result.error);
console.log("API KEY EXISTS:", !!process.env.OPENAI_API_KEY);

const { decomposeThesis } = await import("./thesis-decomposer.js"); 

const company = "TCS";

const thesis =
  "TCS is undervalued because AI will not materially disrupt its business and its margins will recover over the next two years.";

const { claims } = await decomposeThesis(company, thesis);

console.log("\nTHESIS:");
console.log(thesis);

console.log("\nCLAIMS:");

for (const claim of claims) {
  console.log(`\n${claim.id}`);
  console.log(`  ${claim.text}`);
  console.log(`  Importance: ${claim.importance}`);
}