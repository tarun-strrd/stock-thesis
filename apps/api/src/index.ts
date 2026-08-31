import { analyzeThesis } from "@thesis/agents";
import Fastify from "fastify";
import type { Thesis } from "@thesis/domain";
import cors from "@fastify/cors";

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "thesis-api",
  };
});

interface AnalyzeRequest {
  thesis: string;
  company?: string;
}

app.post<{ Body: { thesis: string; company?: string } }>(
  "/analyze",
  async (request, reply) => {
    const { thesis, company } = request.body;

    if (!thesis || typeof thesis !== "string") {
      return reply.status(400).send({
        error: "thesis is required",
      });
    }

    try {
      const result = await analyzeThesis(
        thesis,
        company ?? "TCS",
      );

      return reply.send(result);
    } catch (error) {
      console.error("Analysis failed:", error);

      return reply.status(500).send({
        error: "Analysis failed",
      });
    }
  },
);


app.get("/test-domain", async (): Promise<Thesis> => {
  return {
    id: "test-1",
    company: {
      name: "TCS",
      ticker: "TCS",
    },
    statement:
      "TCS is undervalued because AI will not materially disrupt its business.",
    claims: [],
    createdAt: new Date().toISOString(),
    relationships: []
  };
});

const start = async () => {
  try {
    await app.listen({
      port: 3000,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();