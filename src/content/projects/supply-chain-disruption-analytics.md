---
title: "Supply Chain Disruption Analytics"
summary: "An end-to-end Azure pipeline that takes shipment-delay monitoring from raw CSVs to a statistically validated, predictive delay-risk scoring system with a Power BI dashboard."
tags: [data-engineering, cloud, bi, machine-learning, python]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/supply-chain-disruption-analytics"
demo: null
related: []
status: "deployed"
order: 3
keyResult: "A full analytics lifecycle — ingestion, monitoring, statistical validation, and predictive modeling — translated into a capacity-based prioritization policy, not just a trained model."
whatIdImprove: "The predictive layer is deliberately framed as a ranking tool for prioritizing limited intervention capacity, not a black-box delay predictor; the next step is closing the loop with outcome data on whether the prioritized interventions actually reduced delays."
---

## Overview

Shipment delays directly affect inventory availability, supplier evaluation, and revenue — and in many organizations, delays are only detected after they've already happened. This project builds a layered supply chain analytics system on Azure that creates reliable visibility into shipment performance, validates delay drivers statistically, and then moves toward order-time delay-risk prediction.

The objective was not just to train a model, but to design a complete analytics lifecycle: data ingestion → data engineering → monitoring → statistical validation → predictive modeling → operational policy.

## Architecture

```
Raw CSV
  -> Azure Blob Storage (raw layer)
  -> Azure Data Factory transformation
  -> Curated Parquet dataset
  -> Statistical validation (delay drivers)
  -> Predictive delay-risk model
  -> Power BI dashboard
```

Design decisions worth calling out: raw data is preserved to maintain lineage and reproducibility; the curated Parquet layer exists for performance and a standardized schema; transformation runs in Azure Data Factory specifically to demonstrate cloud-native ELT rather than local scripting; and compute is kept separate from reporting so analytics logic isn't coupled to the visualization layer.

## Results

The statistical validation layer confirmed which delay drivers were real versus noise before any model was trained on them — avoiding the common failure mode of fitting a predictive model to spurious correlations. The resulting risk-scoring model is framed as a ranking tool: it prioritizes which shipments deserve intervention capacity first, rather than claiming to predict delay with certainty. A downloadable Power BI dashboard (.pbix) ships alongside the pipeline for direct inspection.

## Code Highlights

Validation and modeling are kept in clearly separated scripts (`src/sanity_checks/`, `src/actionable_insights/`) so the statistical case for each delay driver is auditable independently of the final model — a reviewer can check the evidence before trusting the score.
