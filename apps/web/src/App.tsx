import { useState } from "react";
import "./App.css";

type Verdict =
  | "supported"
  | "partially_supported"
  | "contradicted"
  | "insufficient_evidence";

interface Evidence {
  id: string;
  statement: string;
  relevance: string;
  polarity: "supports" | "contradicts" | "neutral";
  confidence: number;
  source: {
    title: string;
    url: string;
    tier: string;
  };
}

interface ClaimAnalysis {
  claim: {
    id: string;
    text: string;
    importance: number;
  };
  evidence: Evidence[];
  judgment: {
    verdict: Verdict;
    confidence: number;
    reasoning: string;
  };
}

interface AnalysisResult {
  thesis: string;
  claimAnalyses: ClaimAnalysis[];
  judgment: {
    verdict: Verdict;
    confidence: number;
    reasoning: string;
  };
}

const API_URL = "http://localhost:3000";

function verdictLabel(verdict: Verdict) {
  return verdict.replaceAll("_", " ").toUpperCase();
}

function verdictClass(verdict: Verdict) {
  return `verdict ${verdict}`;
}

function App() {
  const [thesis, setThesis] = useState(
    "TCS is undervalued because AI will not materially disrupt TCS's business and its margins will recover over the next two years.",
  );

  const [company, setCompany] = useState("TCS");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function loadDemo() {
  setCompany("TCS");
  setThesis(
    "TCS is undervalued because AI will not materially disrupt TCS's business and its margins will recover over the next two years.",
  );
  setResult(null);
  setError("");
}

  async function analyze() {
    if (!thesis.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thesis,
          company,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        "Could not connect to the analysis server. Make sure the API is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <section className="hero">
        <div className="eyebrow">INVESTMENT THESIS ANALYZER</div>

        <h1>
          Don't just validate
          <br />
          <span>your thesis.</span>
        </h1>

        <p className="subtitle">
          Break an investment thesis into claims, find evidence,
          and discover what might prove it wrong.
        </p>

        <div className="positioning">
          <strong>Confirmation is easy. Falsification is useful.</strong>
          <span>
            Thesis deliberately searches for evidence that could
            weaken your assumptions before giving you a verdict.
          </span>
        </div>

        <div className="input-card">
          <label>INVESTMENT THESIS</label>

          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="Enter an investment thesis..."
            rows={5}
          />

          <button
  className="demo-button"
  onClick={loadDemo}
>
  Try the TCS example →
</button>

          <div className="input-footer">
            <div>
              <label className="company-label">COMPANY</label>

              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <button
              onClick={analyze}
              disabled={loading || !thesis.trim()}
            >
              {loading ? "ANALYZING..." : "ANALYZE THESIS →"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result && (
        <section className="results">
          <div className="verdict-card">
            <div>
              <div className="section-label">
                OVERALL VERDICT
              </div>

              <div
                className={verdictClass(
                  result.judgment.verdict,
                )}
              >
                {verdictLabel(result.judgment.verdict)}
              </div>
            </div>

            <div className="confidence">
              <span>CONFIDENCE</span>
              <strong>
                {Math.round(
                  result.judgment.confidence * 100,
                )}
                %
              </strong>
              <div className="confidence-note">
  Confidence reflects the assessment of the available
  evidence — not the probability that the thesis is true.
</div>
            </div>
          </div>

          <div className="reasoning-card">
            <div className="section-label">WHY?</div>

            <p>{result.judgment.reasoning}</p>
          </div>

          <div className="section-heading">
            <div>
              <div className="section-label">CLAIMS</div>
              <h2>What the thesis depends on</h2>
            </div>
          </div>

          <div className="claims">
            {result.claimAnalyses.map((analysis) => (
              <ClaimCard
                key={analysis.claim.id}
                analysis={analysis}
              />
            ))}
          </div>

          <div className="challenge-card">
            <div className="challenge-icon">!</div>

            <div>
              <div className="section-label">
                WHAT COULD BREAK THIS THESIS?
              </div>

              <p>
                The analysis identifies unresolved claims
                and evidence gaps that could weaken the
                investment thesis.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function ClaimCard({
  analysis,
}: {
  analysis: ClaimAnalysis;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="claim-card">
      <button
        className="claim-header"
        onClick={() => setOpen(!open)}
      >
        <div className="claim-main">
          <span className="claim-id">
            {analysis.claim.id}
          </span>

          <div>
            <h3>{analysis.claim.text}</h3>

            <span
              className={verdictClass(
                analysis.judgment.verdict,
              )}
            >
              {verdictLabel(
                analysis.judgment.verdict,
              )}
            </span>
          </div>
        </div>

        <div className="claim-meta">
          <strong>
            {Math.round(
              analysis.judgment.confidence * 100,
            )}
            %
          </strong>

          <span>
            {analysis.evidence.length} evidence
          </span>

          <span className="chevron">
            {open ? "↑" : "↓"}
          </span>
        </div>
      </button>

      {open && (
        <div className="claim-details">
          <div className="section-label">REASONING</div>

          <p>{analysis.judgment.reasoning}</p>

          {analysis.evidence.length > 0 && (
            <>
              <div className="section-label evidence-label">
                EVIDENCE
              </div>

              <div className="evidence-list">
                {analysis.evidence.map((item) => (
                  <div
                    className="evidence"
                    key={item.id}
                  >
                    <div
                      className={`polarity ${item.polarity}`}
                    >
                      {item.polarity === "supports"
                        ? "+"
                        : item.polarity ===
                          "contradicts"
                          ? "−"
                          : "○"}
                    </div>

                    <div>
                      <p>{item.statement}</p>

                      <small>
                        {item.relevance}
                      </small>

                      <a
                        href={item.source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.source.title} ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {analysis.evidence.length === 0 && (
            <div className="no-evidence">
              No usable evidence was extracted for
              this claim.
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default App;