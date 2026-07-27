---
title: "NBA Win Probability Engine"
summary: "A machine learning dashboard predicting NBA game win probability before tip-off and live, play-by-play, validated through a real-time 2025-26 Finals run."
tags: [machine-learning, sports-analytics, cloud, deployed, python]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/nba-win-probability-engine"
demo: "https://nba-win-probability-engine.streamlit.app/"
related: ["sim2real-engagement"]
status: "deployed"
order: 1
keyResult: "68.2% accuracy / 0.7357 ROC-AUC pre-game; 74.7% accuracy / 0.83 ROC-AUC live, evaluated on a full future-season holdout (2025-26), not a random split of the training seasons."
whatIdImprove: "The pre-game model's accuracy gap versus the live model shows how much information tip-off-only features leave on the table; a richer pre-game feature set (rest days, injury reports) is the natural next step. The Cloud Run automation was also intentionally retired after the Finals ended rather than left running unmonitored."
---

## Overview

Two questions drive this project: before an NBA game starts, which team is more likely to win, and as the game unfolds play by play, how does that probability change? Most public win-probability tools answer only one of these, and rarely validate against a genuinely unseen future season.

This project builds both a pre-game model and a live, event-level model, trains them on three full regular seasons, and evaluates both against a fourth season the model never saw during training — a future-season holdout, not a random train/test split.

## Architecture

```
NBA data collection (2022-23 → 2025-26)
  -> Cleaning & leakage-safe feature engineering
  -> Pre-game model training (regular season)
  -> Live play-by-play model training
  -> Model evaluation & comparison
  -> Streamlit dashboard (predictions, live replay, model performance)
  -> Google Cloud Run Jobs + Cloud Scheduler (Finals-only automated refresh)
```

Data volume: 4,910 regular-season games across four seasons, 2.3M+ play-by-play event rows for the live model, and a separate 333-game / 154K-row playoff case study.

## Results

| Model | Evaluation setup | Accuracy | ROC-AUC | Notes |
|---|---|---|---|---|
| Pre-game | Train 2022-23→2024-25, test 2025-26 | 68.2% | 0.7357 | Predicts winner before tip-off |
| Live | Train 2022-23→2024-25, test 2025-26 | 74.7% | 0.8300 | Event-level win probability during play |

The model ran live through the 2025-26 NBA Finals (New York Knicks def. San Antonio Spurs, 4-1, series ending 2026-06-13). Pre-game picks were locked before each game and scored against the actual outcome:

| Game | Matchup | Pre-game pick | Confidence | Actual winner | Correct |
|---|---|---|---|---|---|
| 1 | NYK @ SAS | New York Knicks | 61.9% | New York Knicks | Yes |
| 2 | NYK @ SAS | San Antonio Spurs | 55.1% | New York Knicks | No |
| 3 | SAS @ NYK | San Antonio Spurs | 52.8% | San Antonio Spurs | Yes |
| 4 | SAS @ NYK | San Antonio Spurs | 55.0% | New York Knicks | No |
| 5 | NYK @ SAS | New York Knicks | 56.1% | New York Knicks | Yes |

## Code Highlights

The Cloud Scheduler + Cloud Run Jobs automation refreshed deploy-safe report exports for the dashboard during the live Finals series, then was deliberately retired once the series ended — an operational component running only as long as it had a real job to do, not left on indefinitely.
