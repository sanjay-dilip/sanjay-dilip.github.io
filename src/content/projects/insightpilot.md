---
title: "InsightPilot: An AI Data Analyst Agent"
summary: "An agentic AI tool that turns raw CSVs into structured business insight reports, keeping every numeric claim grounded in Pandas-computed statistics rather than LLM guesswork."
tags: [llm, ai-agent, machine-learning, deployed, python]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/insightpilot"
demo: null
related: []
status: "deployed"
order: 5
keyResult: "Every finding must reference an actual column name and a computed value; the LLM never receives raw data, only structured, pre-computed statistics, and unsupported claims are explicitly flagged."
whatIdImprove: "The 7-check evaluator catches ungrounded claims after the fact; a stronger version would constrain generation more tightly up front so fewer candidate claims need to be filtered out post-hoc."
---

## Overview

Business users and students often have CSV datasets but lack the time or skills to extract meaningful insight from them quickly. InsightPilot is an AI-powered data analyst agent: it accepts a CSV, inspects the data, identifies quality issues, suggests business questions, runs grounded analysis using Python and Pandas, and produces a structured insight report — from the terminal or a Streamlit UI.

The core design constraint: the LLM (Gemini API) is used only for language tasks — suggesting business questions, summarizing findings, writing the report narrative. All numeric analysis is done exclusively by Python and Pandas. The model never sees raw data, only structured, pre-computed statistics, and every finding must cite a real column name and value.

## Architecture

```
CSV input
  -> data_profiler (columns, types, missing values, duplicates, statistics)
  -> analysis_tools (correlations, outliers, missingness — Pandas only)
  -> Gemini API (business questions, narrative — language only)
  -> report_generator
  -> Structured insight report (terminal or Streamlit)
```

Agent workflow: load and profile the CSV, infer what the dataset is about, identify data-quality issues and limitations, suggest relevant business questions, run grounded Pandas analysis, generate deterministic rule-based recommendations tied to detected issues, produce the report, and flag any unsupported claims.

## Results

A 7-check evaluator sits between the analysis and the final report, verifying that every claim in the generated report is actually grounded in a computed statistic before it's shown to the user — a concrete guardrail against LLM hallucination in a data-analysis context, backed by a pytest test suite.

## Code Highlights

Splitting "what the numbers say" (Pandas) from "how to explain them" (Gemini) into two hard-separated stages is the single most important design decision here — it's what makes the grounding guarantee enforceable rather than aspirational.
