---
title: "Sim2Real User Engagement Analysis"
summary: "A comparison of user-engagement and churn modeling between simulated anime-viewing data and real Steam gameplay data, examining how data realities shape modeling assumptions."
tags: [machine-learning, data-science, python]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/sim2real-engagement"
demo: null
related: []
status: "deployed"
order: 7
keyResult: "Two parallel pipelines — clean simulated timestamps vs. real gameplay data with no session boundaries — built specifically to expose how churn/retention definitions and feature importance shift when moving from simulation to reality, not to chase the highest accuracy number."
whatIdImprove: "The comparison is currently framed qualitatively (what changes and why); a natural extension is quantifying how much of the feature-importance shift is attributable to data structure versus genuinely different user behavior between domains."
---

## Overview

User engagement is often studied using simulated or synthetic data, where clean timestamps, session boundaries, and clear behavioral signals are readily available. Real-world data is messier: it's frequently incomplete and requires proxy definitions for core concepts like retention and churn. This project deliberately builds two parallel pipelines to make that gap visible and concrete, rather than picking one dataset and treating its assumptions as universal.

- A simulated anime-viewing pipeline with explicit episode progression and time-based retention
- A real Steam gameplay pipeline, where churn has to be inferred from engagement depth since there are no session timestamps or episode-like structure
- A shared analysis layer comparing both, to highlight structural differences in engagement signals and model behavior

The goal isn't the most accurate model — it's understanding how modeling assumptions, feature importance, and churn definitions shift when moving from simulation to real data.

## Architecture

```
sim2real-engagement/
├── anime_simulated/   (notebooks, models, data — clean synthetic signals)
├── steam_real/        (notebooks, models, data — messy real signals)
├── shared/             (comparison app)
└── tests/              (label construction, split reproducibility,
                          v1/v2 label agreement across both pipelines)
```

## Results

The simulated pipeline supports a probabilistic, multi-signal model built on explicit session timestamps and watch duration, with retention defined cleanly as continuation to the next episode. The real Steam pipeline has no such luxury — churn has to be defined from aggregated gameplay statistics rather than session-level events, forcing a proxy-based approach. Comparing the two side by side, in one shared analysis layer, makes the practical cost of "clean" versus "real" data assumptions concrete rather than abstract.

## Code Highlights

A pytest suite specifically validates label construction, split reproducibility, and v1/v2 label agreement across both pipelines — treating the churn-label definition itself as something that needs testing, not just the model trained on top of it.
