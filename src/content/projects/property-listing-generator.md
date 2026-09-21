---
title: "Property Listing Generator"
summary: "Turns a subject property, a handful of comps, and a listing style into a structured listing that leads with the property's genuine differentiators, decided by a deterministic comparison engine before any writing happens."
tags: [llm, deployed, python]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/property-listing-generator"
demo: null
related: ["drug-interaction-checker"]
status: "deployed"
order: 7
keyResult: "A deterministic Layer 1 scores every subject feature and 6 numeric fields (sqft, lot size, beds, baths, year built, list price) for prevalence and rarity against the supplied comps, selecting 3-5 defensible differentiators before any copy is written. The optional LLM can only reword the resulting headline/body — never invent a feature, number, or claim — and a post-generation validator checks structure, unsupported superlatives, fabricated amenities, untraceable numbers, and fair-housing demographic language."
whatIdImprove: "The safety validator is a practical, best-effort net (a denylist plus a numeric-grounding check), not an exhaustive fact-checker — generated copy still needs human review, and the tool makes no claim of legal, MLS, or fair-housing compliance on its own. Comps-only comparison is also a hard boundary: a different comp set changes which differentiators get selected, since there's no external market data source."
---

## Overview

A listing that restates every feature it was given reads like a checklist, not a pitch. This tool inverts that: it analyzes a subject property against a handful of comparable properties first, decides what's genuinely rare or favorable, and only then writes copy — so the listing leads with what actually differentiates the property instead of an undifferentiated feature dump.

## Architecture

```
property data + comparable properties
  -> validation (JSON -> models, per-comp warnings instead of hard failures)
  -> comp_analyzer (Layer 1: prevalence + numeric comp statistics)
  -> scoring (Layer 1: deterministic scoring + selection, no LLM)
  -> writer / llm_writer (Layer 2: deterministic offline writer, or optional LLM rewrite)
  -> safety (post-generation grounding + fair-housing validator)
```

Data flows one way, and only `llm_writer.py` and `cli.py` know an LLM exists at all. Differentiator scoring combines rarity, style relevance, and confidence (`0.60 * rarity + 0.25 * style_relevance + 0.15 * confidence` for categorical features; a comparable weighted formula for numeric ones), with direction enforced on top — a lower list price, for example, only counts as positive for `investor` and `first_time_buyer` styles, framed strictly as "below the comp median," never as affordability advice.

## Results

`select_differentiators` picks the top 3-5 candidates above a defensibility threshold, deterministically tie-broken; with fewer than 3 comp-grounded candidates it falls back to real, subject-verified features flagged as not comp-compared — it never fabricates a candidate to hit the target. If the optional LLM path is enabled, it receives only the already-selected differentiators, their evidence, the required JSON schema, and a list of prohibited phrases and topics — never raw comp records, and never the choice of which differentiators to use. Any parse failure, grounding failure, or provider error triggers one retry, then a fallback to the deterministic writer with a recorded warning. 103 tests cover validation, scoring, the LLM writer (a fake in-process provider, no network calls), the safety validator, and the CLI.

## Code Highlights

`safety.validate_listing` runs after generation regardless of which writer produced the copy: it checks output structure, a denylist of unsupported superlatives and invented-claim topics (school district, commute time, cap rate, rental income), a curated list of commonly fabricated amenities not among the subject's own features, and a numeric check flagging any number not traceable to the verified input. A separate `DEMOGRAPHIC_PHRASES` filter blocks language about who should live in the property ("perfect for," "safe neighborhood," "families with children") while keeping property-focused language allowed — a fair-housing safeguard baked into the pipeline rather than left to prompt instructions.
