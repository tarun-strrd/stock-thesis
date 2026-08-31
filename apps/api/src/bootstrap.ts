import dotenv from "dotenv";
import path from "node:path";

const envPath = path.resolve(process.cwd(), "../../.env");

const result = dotenv.config({
  path: envPath,
});

console.log("ENV PATH:", envPath);
console.log(
  "dotenv loaded:",
  result.error ? result.error.message : "YES",
);
console.log(
  "OPENAI KEY:",
  process.env.OPENAI_API_KEY ? "FOUND" : "MISSING",
);

require("./index");