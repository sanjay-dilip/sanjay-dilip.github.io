---
title: "WC2026 Format Evaluation"
summary: "A Snowflake data pipeline and Power BI dashboard testing whether FIFA's 48-team World Cup expansion hurt competitive balance, backed by five statistically validated analytics marts."
tags: [data-engineering, cloud, bi, sports-analytics, python, sql]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/wc2026-format-eval"
demo: null
related: ["supply-chain-disruption-analytics", "nba-win-probability-engine"]
status: "deployed"
order: 2
keyResult: "Confederation performance is the only tested factor with a statistically significant, medium-effect association with match outcomes (Kruskal-Wallis, p=0.0009, epsilon-squared=0.079); competitive balance and upset rate show no significant change under the 48-team format, and every non-match input dataset (rankings, draw, venues, confederations) checked 100% against a second, independent source."
whatIdImprove: "Every result is a single-tournament snapshot with no live refresh mechanism; the next step is re-running the same validated pipeline against 2030's format once that data exists, so the comparison stops being retrospective."
---

## Overview

FIFA expanded the men's World Cup from 32 to 48 teams starting in 2026. This project builds an end-to-end Snowflake analytics pipeline — raw ingestion, automated data-quality validation, a dimensional model, and five statistically validated analytical marts — to test that expansion against 104 matches from the 2026 tournament and 116 matches from two prior formats (2022's 32-team and 1994's 24-team World Cups), all under the same metric definitions.

The objective was not just to build a dashboard, but to demonstrate a full governed analytics lifecycle: sourcing and cross-verification → raw ingestion → validation → dimensional modeling → statistical testing → cross-account governance → BI presentation.

## Architecture

```
Raw sources (match results, draw, rankings, venues, confederations)
  -> Snowflake RAW schema (unmodified landing, load-audited)
  -> VALIDATION schema (automated data-quality checks)
  -> CORE schema (dimensional star schema)
  -> ANALYTICS schema (5 statistically validated marts)
  -> SHARED schema (Secure Data Share, cross-account governed access)
  -> Power BI report (8 pages, reads only from governed secure views)
```

Design decisions worth calling out: raw data is preserved unmodified for lineage and reproducibility; validation runs before any dimensional modeling so nothing fails silently downstream; Streams and Tasks handle incremental loads so new matches don't require a full rebuild; and the Power BI layer has zero direct access to raw or intermediate schemas, reading only from `SHARED`'s governed secure views.

## Results

Five hypothesis tests (Mann-Whitney U, Fisher's exact, Kruskal-Wallis, Spearman rank correlation) compared the 48-team 2026 format against pooled 2022/1994 data. Competitive balance (p=0.397) and upset rate (p=0.136) showed no statistically significant change under expansion — if anything, both point numerically away from the "expansion hurt competitive balance" concern, not toward it. Confederation performance was the one factor with a significant, medium effect (p=0.0009), and pre-tournament FIFA ranking correlated strongly with final finish in all three tournaments (Spearman's rho -0.61 to -0.64). Every non-match-result input (rankings, draw, venues, confederation crosswalk) was independently cross-checked against a second source, with 100% agreement. The incremental-load pipeline was proven identical to a full rebuild by content-hash comparison across three real scenarios. Full statistical output is generated directly from the live Snowflake account, not hand-computed.

## Code Highlights

Validation, dimensional modeling, and statistical testing are kept in clearly separated schemas and scripts (`RAW` → `VALIDATION` → `CORE` → `ANALYTICS`) so each stage's correctness can be checked independently before the next stage builds on it — a reviewer can verify the data was clean before trusting the statistics built on top of it. Cross-account access is enforced through a Secure Data Share, verified by attempting (and failing) to query `RAW` from the consumer account.
