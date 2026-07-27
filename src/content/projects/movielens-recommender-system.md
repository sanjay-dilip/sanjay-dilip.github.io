---
title: "MovieLens Recommender System"
summary: "A full movie recommender system combining ALS collaborative filtering with a LightGBM hybrid ranking model, deployed as a Streamlit app."
tags: [machine-learning, recommender-systems, deployed, python]
role: "Solo project"
timeframe: "2026"
github: "https://github.com/sanjay-dilip/movielens-recommender-system"
demo: null
related: []
status: "deployed"
order: 4
keyResult: "Combines a pure collaborative-filtering signal (ALS) with content features (genres, user profiles) in a LightGBM hybrid ranker, rather than relying on either signal alone."
whatIdImprove: "The hybrid ranker currently blends ALS score and content similarity through LightGBM; a natural extension is adding implicit feedback signals (watch time, skips) beyond explicit ratings."
---

## Overview

People face too many streaming choices, and a plain popularity list doesn't help anyone find something they'll actually like. A good recommender needs to learn from what a user watched or rated, what similar users liked, and what a movie actually contains — this project brings all three together into one system.

This is an expanded, complete version of an earlier [MovieLens EDA notebook](https://github.com/sanjay-dilip/movielens-data-analysis), which covered exploratory analysis and a simple collaborative baseline. This project turns that into a full pipeline: data processing, an ALS collaborative model, a hybrid LightGBM ranking model, and a Streamlit app.

Both projects originally lived together inside a general `Data-Science-Projects` collection and were later split into their own dedicated repositories as the work matured.

## Architecture

```
Raw MovieLens data (ratings.dat, movies.dat)
  -> Data pipeline (ID re-indexing, cleaning)
  -> ALS collaborative model (sparse matrix, user/item factors)
  -> Content feature builder (genres, user profiles, similarity)
  -> Hybrid ranking model (LightGBM: ALS score + content features)
  -> Streamlit app
```

The dataset schema: `ratings.dat` (user_id, movie_id, rating, timestamp) and `movies.dat` (movie_id, title, genres), both originally `::`-delimited and converted to numeric indices during preprocessing.

## Results

The ALS model captures collaborative "users like you" signal, while the content-feature layer captures "movies like this one" — the LightGBM hybrid ranker learns how to weight both signals together rather than picking one. The result is served through a Streamlit interface where recommendations can be explored interactively.

## Code Highlights

Keeping the ALS collaborative signal and the content-feature builder as separate, independently testable stages — combined only at the final LightGBM ranking step — makes it possible to evaluate each signal's contribution on its own before trusting the blended ranking.
