---
title: "Predicting Smartphone Addiction (Kaggle)"
summary: "A gradient-boosting pipeline predicting smartphone addiction risk from self-reported usage data for a Kaggle Playground Series competition, built around a validated cross-validation harness and a frozen-control feature-engineering process."
tags: [machine-learning, data-science, python]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/kaggle-smartphone-addiction"
demo: null
related: ["sim2real-engagement"]
status: "in progress"
order: 12
keyResult: "Best validated model (tuned XGBoost + one engineered feature, screen_residual) reaches CV mean ROC AUC 0.96499 (public leaderboard 0.96653) on a synthetic 691k-row dataset; CV and public-leaderboard rankings agree perfectly across every submission (Spearman = Kendall = 1.0). Private-leaderboard result is pending competition close."
whatIdImprove: "Once the competition closes: record the private leaderboard result, final rank, and percentile, and run a consolidation build. The README's setup instructions could also use a cold-clone test (fresh venv, fresh clone, verbatim commands) before calling the project complete."
---

## Overview

The task is binary classification: predict whether a person is flagged as addicted from self-reported screen time, app usage, sleep, and lifestyle fields, scored by ROC AUC on a synthetic Kaggle dataset. Because the data is generated rather than collected, the project spends real effort auditing the generator itself — where the signal actually sits, whether it's exploitable, and whether exploiting it would even be legitimate — rather than only asking what's true about smartphone use in general.
