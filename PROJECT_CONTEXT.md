# Thesis — Project Context

## Current Status

### Completed

[x] pnpm monorepo
[x] TypeScript workspace
[x] Fastify API
[x] @thesis/domain package
[x] API -> domain integration
[x] @thesis/agents package
[x] OpenAI API integration
[x] Thesis decomposer
[x] Atomic claim decomposition
[x] Claim types
[x] Claim relationships
[x] Claim origin: explicit / inferred
[x] Evidence model
[x] Evidence source tiers
[x] Research abstraction
[x] OpenAI web search provider
[x] Search result/citation extraction
[x] Source fetching
[x] HTML source cleaning with Cheerio
[x] Evidence extraction from source documents
[x] Workspace typecheck
[x] Workspace build

---

## Current Working Pipeline

User thesis
    ↓
Thesis Decomposer
    ↓
Atomic Claims + Claim Relationships
    ↓
Research Query
    ↓
OpenAI Web Search
    ↓
ResearchResult[]
    ↓
Source Reader
    ↓
Clean SourceDocument
    ↓
Evidence Extractor
    ↓
Evidence[]

Current pipeline ends here.

---

## Thesis Decomposer

The decomposer separates:

- conclusion
- assumption
- prediction
- fact

Claims also have an origin:

- explicit
- inferred

Logical relationships are represented separately from claims.

Supported relationships:

- supports
- contradicts
- depends_on

### Decomposer experiment

Input:

"TCS is undervalued because AI will not materially disrupt its
business and its margins will recover over the next two years."

Current useful output:

C1:
TCS is undervalued.
Type: conclusion
Importance: 1

C2:
AI will not materially disrupt TCS's business.
Type: assumption
Importance: 0.9

C3:
TCS's margins will recover over the next two years.
Type: prediction
Importance: 0.9

Earlier versions incorrectly created a conditional claim such as:

"If AI does not disrupt TCS and margins recover, then TCS
will be undervalued."

This was removed by explicitly separating logical relationships
from atomic claims.

The decomposer also previously inferred:

"TCS's margins are currently depressed."

This highlighted the need for explicit vs inferred claim origin.

---

## Research Layer

Location:

packages/agents/src/research/

Files:

- types.ts
- web-search.ts
- source-reader.ts
- index.ts

### Research flow

ResearchQuery
    ↓
searchWeb()
    ↓
OpenAI Web Search
    ↓
Citation annotations
    ↓
ResearchResult[]

Search results are deduplicated by URL.

Important principle:

Search result != Evidence.

The research layer only discovers relevant sources.

---

## Source Reader

The source reader fetches discovered URLs and converts them
into SourceDocument objects.

SourceDocument:

- title
- url
- content
- publishedAt

HTML sources are cleaned using Cheerio.

The reader removes:

- script
- style
- noscript
- svg
- nav
- footer

The cleaned document is then passed to evidence extraction.

PDF support is NOT implemented yet.

---

## Evidence Extractor

Location:

packages/agents/src/evidence-extractor.ts

Purpose:

Extract claim-specific factual evidence from a source.

Input:

- Claim
- SourceDocument

Output:

Evidence[]

Evidence includes:

- id
- statement
- polarity
- confidence
- source
- retrievedAt

Evidence polarity:

- supports
- contradicts
- neutral

Source tiers:

- primary
- regulatory
- secondary
- tertiary

### Evidence extraction experiment

Claim:

"TCS's margins will recover over the next two years."

TCS Q1 FY27 results produced evidence including:

1. TCS reported a 24.0% operating margin in Q1 FY27.
   Polarity: neutral

2. Management emphasized maintaining industry-leading
   profitability while making wage and AI investments.
   Polarity: supports, but moderate confidence

3. AI-led optimization and productivity initiatives may
   support future efficiency.
   Initially classified as supporting, but this exposed a
   weakness in the extractor.

4. The source does not provide a specific two-year forecast
   for margin recovery.
   Polarity: neutral, high confidence

### Learning

The extractor must NOT treat speculative statements such as:

- could
- may
- might
- potential
- aspirations

as strong supporting evidence unless the source explicitly
connects them to the claim.

Evidence extraction should distinguish:

"Source says X"

from:

"X proves the claim."

The latter is the job of the Evidence Judge.

---

## Next Immediate Task

Build the contradiction/challenge research flow.

For each important claim, deliberately search both directions:

### Supporting research

"Evidence supporting:
TCS margin recovery over the next two years"

### Contradictory research

"Evidence against:
TCS margin recovery over the next two years"

Also generate risk/challenge queries such as:

- TCS margin pressure outlook
- TCS margin risks FY27
- reasons TCS margins may not recover
- TCS profitability guidance

The goal is NOT to always prove the investor wrong.

The goal is to determine whether the investor's thesis
survives the available evidence.

---

## Next Agent: Evidence Judge

After contradictory evidence is available:

Claim
    ↓
Supporting Evidence
    +
Contradictory Evidence
    ↓
Evidence Judge
    ↓
Claim Verdict

Possible claim verdicts:

- supported
- partially_supported
- contradicted
- insufficient_evidence

The judge should consider:

- evidence relevance
- source quality
- source tier
- recency
- directness
- contradiction
- confidence

The judge must not make an investment recommendation.

---

## Final MVP Pipeline

Because the hackathon deadline is close, prioritize this
end-to-end path:

Thesis
    ↓
Decompose
    ↓
Research
    ↓
Source retrieval
    ↓
Evidence extraction
    ↓
Supporting + contradictory research
    ↓
Evidence Judge
    ↓
Overall Thesis Verdict

Do NOT prioritize yet:

- PostgreSQL
- sophisticated memory
- monitoring
- complex frontend
- multiple unnecessary agents
- production-grade infrastructure
- PDF support unless required for the demo

The goal is a reliable end-to-end demo.

---

## Hackathon Evaluation

The project should eventually compare against a simple baseline.

Baseline:

A single general-purpose LLM prompt asking it to analyze
the company and investment thesis.

Agent solution:

Thesis decomposition
→ targeted research
→ evidence extraction
→ contradictory research
→ evidence judgment
→ thesis verdict

Potential primary metric:

Claim-level evidence accuracy / reviewer agreement.

Additional metrics:

- evidence coverage
- contradiction detection
- unsupported claims
- human time
- cost per analysis

Target evaluation set:

10+ fixed thesis cases if time permits.

Include at least one challenging case where the obvious
narrative is misleading.

---

## Improvement Changelog

### Baseline

Started with a simple thesis decomposition prompt.

Result:
The model produced atomic claims but also created conditional
claims representing the logical relationship between assumptions
and conclusions.

Learning:
Claims and relationships need to be represented separately.

### Iteration 1 — Atomic claims + relationships

Changed the decomposer to explicitly separate claims from
logical relationships.

Result:
Conditional redundant claims were removed.

Learning:
The representation should distinguish what is claimed from
how claims relate to one another.

### Iteration 2 — Explicit vs inferred claims

Observed that the decomposer inferred:

"TCS's margins are currently depressed."

The investor did not explicitly state this.

Learning:
Claims need an explicit/inferred origin.

### Iteration 3 — Research layer

Added a provider-agnostic research abstraction and OpenAI
web search.

Result:
The system successfully discovered primary TCS sources,
including financial results and earnings-call material.

Learning:
Search should discover sources, not become the evidence itself.

### Iteration 4 — Source Reader

Added source fetching and HTML cleaning.

Result:
A real TCS source could be retrieved and converted into a
clean SourceDocument.

Learning:
Raw HTML should not be passed directly to the evidence model.

### Iteration 5 — Evidence Extraction

Added claim-specific evidence extraction.

Result:
The system extracted relevant evidence and correctly identified
when a source did NOT establish the future margin-recovery claim.

Learning:
Evidence extraction must be stricter about speculative or
indirect statements.

### Next

Add deliberately contradictory research and Evidence Judge.

---

## Main Product Insight

The system is not designed to "argue against" the investor.

It is designed to test whether the investor's reasoning survives
the evidence.

The system should be capable of saying:

"Your thesis is supported."

when evidence supports it.

The valuable behavior is:

"Here are the assumptions your thesis depends on.
Here is the evidence supporting them.
Here is the evidence challenging them.
Here is where your reasoning does and does not hold."

---

## Current Next Step

Implement contradictory/challenge research.

After that:

1. Evidence Judge
2. Thesis Verdict
3. Minimal API endpoint
4. Minimal UI/demo
5. Evaluation + baseline
6. README/changelog
7. Reproduction guide
8. Agent trajectories