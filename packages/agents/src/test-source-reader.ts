import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const { readSource } =
  await import("./research/source-reader.js");

const source = await readSource({
  title: "TCS Q1 FY27 Results",
  url: "https://www.tcs.com/who-we-are/newsroom/press-release/tcs-financial-results-q1-fy-2027",
});

console.log("TITLE:", source.title);
console.log("URL:", source.url);
console.log("CONTENT LENGTH:", source.content.length);
console.log("\nFIRST 1000 CHARACTERS:\n");
console.log(source.content.slice(0, 1000));