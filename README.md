# Thesis

### Don't just validate your investment thesis. Try to break it.

Thesis takes an investment thesis, decomposes it into atomic claims,
researches those claims, extracts evidence, and judges whether the
available evidence actually supports the thesis.

## The Problem

Investors often research to confirm what they already believe.

A thesis can look convincing while depending on one or two unsupported
assumptions.

## What Thesis Does

1. Decomposes a thesis into claims
2. Identifies dependencies between claims
3. Searches for relevant evidence
4. Reads primary sources
5. Extracts supporting, contradicting and neutral evidence
6. Judges each claim
7. Produces an overall thesis verdict

## Example

> TCS is undervalued because AI will not materially disrupt TCS's
> business and its margins will recover over the next two years.

Thesis can identify:

- TCS is undervalued
- AI will not materially disrupt the business
- Margins will recover over two years

It can then distinguish between:

- Supported
- Partially supported
- Contradicted
- Insufficient evidence

## Architecture

Thesis
↓
Claim Decomposer
↓
Research
↓
Source Reader
↓
Evidence Extractor
↓
Evidence Judge
↓
Thesis Judge
↓
Verdict

## Why It's Different

Thesis does not equate "I found supporting information" with
"the thesis is true."

It explicitly considers evidence that could weaken the thesis and
distinguishes contradiction from lack of evidence.

## Tech Stack

- TypeScript
- Node.js
- Fastify
- React
- Vite
- OpenAI API

## Running Locally

### Install

pnpm install

### Environment

Copy `.env.example` to `.env` and add your OpenAI API key.

### API

pnpm --filter @thesis/api dev

### Web

pnpm --filter web dev
