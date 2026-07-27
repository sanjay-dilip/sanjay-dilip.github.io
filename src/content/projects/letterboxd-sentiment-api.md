---
title: "Letterboxd Movie Sentiment API"
summary: "A sentiment system for messy, sarcastic Letterboxd reviews — weak labels from star ratings, a TF-IDF baseline, a fine-tuned DistilBERT model, and a FastAPI backend."
tags: [nlp, machine-learning, python, deployed]
role: "Solo project"
timeframe: "2025"
github: "https://github.com/sanjay-dilip/letterboxd-sentiment-api"
demo: null
related: []
status: "deployed"
order: 6
keyResult: "~3,500 total reviews processed after cleaning, with ~514 strict weak-labeled reviews and a 49-sample manually labeled evaluation set used to sanity-check the weak-label pipeline against real human judgment."
whatIdImprove: "The manual evaluation set (49 samples) is small; it's enough to sanity-check the weak-label pipeline but not enough to draw strong conclusions about real-world accuracy — expanding it is the clearest next step."
---

## Overview

Letterboxd reviews are not straightforward: people joke, use slang, flip meanings, and the star rating doesn't always match the text. This project tests how far a sentiment system can get using weak labels from star ratings, a simple baseline model, a transformer fine-tuned on the same data, and a small human-labeled evaluation set — served through an actual API.

The dataset is a scraped collection of Letterboxd reviews with movie name, release year, review text, star ratings (including broken Unicode characters that needed repair), review date, and like/comment counts.

## Architecture

```
Raw scraped reviews
  -> Fix corrupted star-rating characters, convert to numeric
  -> Build strict binary weak labels from star ratings
  -> Clean review text, parse dates, drop unusable rows
  -> TF-IDF baseline model
  -> Fine-tuned DistilBERT model
  -> FastAPI backend serving predictions
```

## Results

After cleaning, the dataset held numeric star ratings, clean review text, a loose 3-class sentiment label, and a strict binary sentiment label, across roughly 3,500 total reviews. A 49-sample manually labeled set (independent of the star-rating weak labels) was used to check whether the weak-label assumption actually held up against human judgment — the kind of check that's easy to skip and easy to regret skipping.

## Code Highlights

Keeping the weak-label pipeline (derived from star ratings) and the manual evaluation set (derived from actual human reading) as two clearly separate data sources — rather than treating the weak labels as ground truth — is what makes the accuracy claims here honest rather than circular.
