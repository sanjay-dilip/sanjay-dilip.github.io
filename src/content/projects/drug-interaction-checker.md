---
title: "Drug Interaction Checker"
summary: "A command-line tool that checks a patient's medication list for drug-drug interactions and ranks them by severity, grounding every fact in a curated local dataset rather than an LLM's medical knowledge."
tags: [llm, deployed, python]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/drug-interaction-checker"
demo: null
related: ["insightpilot", "property-listing-generator"]
status: "deployed"
order: 6
keyResult: "Every interaction's severity, mechanism, and recommended action comes only from a curated CSV, never inferred from drug classes or general knowledge; the optional LLM step is validated so it cannot change a severity/action, invent a drug or number, or drop a drug name — any validation failure falls back to the deterministic explanation, so the request never fails because of the LLM."
whatIdImprove: "Name resolution is currently exact-match plus alias lookup only, so a misspelled or unlisted medication comes back as unknown rather than a best guess; adding fuzzy matching would reduce that. Multi-drug (three-way+) interaction inference is also out of scope for this build and would be the natural next capability."
---

## Overview

A patient's medication list can hide interactions that only surface when someone actually checks each pair against a clinical reference. This CLI tool takes a list of medications, resolves each name (normalizing case, matching aliases, deduplicating), generates every unique pair, and looks each one up against a curated interaction dataset — ranking the results major-to-minor rather than returning them in input order.

## Architecture

```
request JSON
    -> parse_medication_input()      validate shape
    -> resolve_medications()          normalize, alias-match, dedupe
    -> generate_pairs()                unique unordered pairs
    -> lookup_interactions()           match against curated CSV
    -> rank_interactions()             major > moderate > minor
    -> ExplanationProvider.explain()   patient-friendly text
    -> serialize_report()              -> response JSON
```

`check_medications()` is the single orchestration entry point; the CLI only handles argument parsing, file I/O, and exit codes. The dataset loader validates that interaction pairs are stored in canonical order and that every severity is one of `major`/`moderate`/`minor`, raising a `DataIntegrityError` on a broken dataset rather than silently accepting bad data.

## Results

The optional `--llm` explanation path can only rewrite the deterministic explanation already generated from the retrieved interaction record — it's given the two drug names, severity, mechanism, clinical text, and recommended action, and never sees the full dataset or decides whether an interaction exists. Every LLM output is validated; an unavailable provider, a timeout, malformed output, a missing drug name, or an invented number all fall back to the deterministic explanation. No real LLM provider is wired up in this build, so `--llm` currently always uses that fallback path — the interface and its validation are fully tested regardless. A pair with no dataset entry is left out of the results entirely rather than assumed safe; an unrecognized drug name is reported separately as `unknown_drugs` instead of being silently dropped.

## Code Highlights

The dataset safety boundary is architectural, not just a prompt instruction: `interaction_store.py` is the only code path that can produce an interaction fact, and `explainer.py`'s LLM provider is a mockable `ExplanationProvider` protocol wrapping a rewrite-only operation. All tests run offline against synthetic fixture CSVs, with no network access or API key required by the default path.
