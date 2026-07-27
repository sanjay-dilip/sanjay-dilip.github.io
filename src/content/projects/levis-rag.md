---
title: "Levi's RAG — AI Due Diligence Copilot"
summary: "A retrieval-augmented generation tool that answers financial due-diligence questions about Levi Strauss & Co. strictly from its SEC filings, with every answer tiered by evidence strength."
tags: [llm, rag, deployed, python, nlp]
role: "Solo project, inspired by findings from a prior team analytics practicum report"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/levis-rag"
demo: "https://levis-rag.vercel.app"
related: []
status: "deployed"
order: 2
keyResult: "85.0% Recall@10 (51/60) on the retrieval evaluation set, with 63/64 tests passing."
whatIdImprove: "Evidence tiering is the core safety mechanism here, but it depends on the retrieval step surfacing the right chunk in the first place; the 15% recall gap is where a wrong or missing citation could still slip through, so expanding the evaluation set and tightening chunk-level retrieval is the highest-leverage next step."
---

## Overview

Doing quick, evidence-backed due diligence on a public company usually means manually digging through dozens of dense SEC filings to find one number, or trusting a generic chatbot's answer with no way to verify where it came from. This tool sits in between: it answers a natural-language financial question about Levi Strauss & Co. (SEC CIK 0000094845) using only its official 10-K, 10-Q, and 8-K filings, and shows exactly which filing, section, and sentence the answer came from.

The idea grew directly out of a BUAN 6390 Analytics Practicum equity research report (Group 7, May 2026) that analyzed a proposed $50M strategic transformation for Levi Strauss, including several market-trend and strategic claims about the brand. Reports like that make claims that sound plausible but aren't always checked against the company's own primary evidence — this project tests that idea directly, as an individual build.

Target user: an equity research associate or analyst doing single-name due diligence, who needs a fast answer but still has to trust and verify it before using it in real work.

## Architecture

```
SEC EDGAR filings (10-K, 10-Q, 8-K)
  -> Document parsing & metadata-aware chunking
  -> Retrieval index
  -> Query -> retrieval -> LLM answer generation
  -> Evidence-tier classification
  -> FastAPI backend (Render) <-> Next.js frontend (Vercel)
```

Every answer is tagged with one of four evidence tiers, so the user knows how much weight to put on it:

- **Verified-from-filing** — stated directly in a filing
- **Management-qualitative-statement** — said by management, not a hard number
- **Third-party-benchmark** — sourced from an external report or vendor claim
- **Model-inference** — the system's own calculation or conclusion

## Results

Retrieval quality: **85.0% Recall@10 (51/60)** on the evaluation set. Test suite: **63/64 passing**. The app and API are both live — `GET /health` and `POST /query` on the backend, full UI on the frontend.

## Code Highlights

The evidence-tier classifier is the load-bearing safety feature: instead of letting the LLM present every answer with equal confidence, each response is routed through a tier check before being shown, so a model-inferred estimate is never presented with the same weight as a number stated directly in a 10-K.
