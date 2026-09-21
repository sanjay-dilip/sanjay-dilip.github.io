---
title: "Intelligent AI Workflow Automation"
summary: "An operational decision-support system that predicts business-workflow risk from structured process data and pairs it with a fully separate, deterministic rules engine for KPIs, SLA alerts, and recommendations, surfaced in a live Streamlit dashboard."
tags: [machine-learning, data-engineering, deployed, python]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/intelligent-ai-workflow-automation"
demo: null
related: ["supply-chain-disruption-analytics"]
status: "deployed"
order: 4
keyResult: "Random Forest workflow-risk classifier reaches 0.560 accuracy / 0.493 macro F1 on a stratified 80/20 split of a 2000-row synthetic dataset, clearly ahead of stratified-dummy (0.355 accuracy) and logistic-regression (0.438 accuracy) baselines — evaluated on synthetic data only, not a claim about real-world performance."
whatIdImprove: "The dashboard runs locally only; deploying it publicly (e.g. Streamlit Community Cloud) would remove the install barrier to trying it. SHAP-based per-prediction diagnostics would also strengthen the model side, kept strictly separate from the rules engine's threshold-based explanations so the two layers don't blur."
---

## Overview

Business workflows — invoice processing, purchase-order approval, support escalation, claims processing — silently accumulate SLA delays, manual-step overhead, and rework until an operations team discovers the problem after the fact. This project builds a decision-support system for that gap: a Random Forest classifier predicts per-workflow risk (low/medium/high) from operational signals, while a fully separate, deterministic rules engine computes KPIs, SLA alerts, and category-tagged recommendations — independent of the model, so every alert a user sees is traceable to a plain-English threshold rather than an opaque "the model said so."

## Architecture

```
Synthetic data generator
  -> Validation (required columns, nulls, timestamp consistency)
  -> Shared feature-preparation path (5 engineered ratios)
  -> Random Forest classifier (+ Dummy / Logistic baselines)
  -> Rules engine (7 deterministic rules, one central threshold config)
  -> KPI / alert / recommendation engines
  -> Streamlit dashboard (6 tabs, live "re-run pipeline" button)
```

`service.run_pipeline` is the single orchestration entry point tying together validation, prediction, KPIs, alerts, and recommendations — both the CLI and the dashboard's re-run button call it, so there is exactly one pipeline implementation to keep correct. Leakage columns (`risk_label`, `workflow_id`, `workflow_name`, timestamps) are excluded by construction and by an explicit test asserting they never reach the fitted model's `feature_names_in_`.

## Results

| Model | Accuracy | F1 (macro) | F1 (weighted) |
|---|---|---|---|
| Dummy (stratified) | 0.355 | 0.321 | 0.356 |
| Logistic Regression | 0.438 | 0.408 | 0.435 |
| **Random Forest (primary)** | **0.560** | **0.493** | **0.540** |

The rules engine runs independently of these numbers: 7 threshold-based rules (SLA breach, approaching SLA, high error/rework rates, manual/automation opportunity, backlog pressure, and model-driven high-risk escalation) each map to a structured alert and one of 8 recommendation categories, so operational output stays explainable even where the model is uncertain.

## Code Highlights

`prepare_feature_frame(df)` is the single feature-preparation path used identically at training and inference time, preventing the classic bug of training and serving computing features differently. 110 tests cover config, validation, feature engineering, model training/evaluation, the leakage-column guarantee against the fitted pipeline itself, and boundary conditions at every rules-engine threshold.
