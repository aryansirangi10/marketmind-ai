# Machine Learning & Analytics Service

A Python FastAPI service that handles data-intensive analysis: stock/crypto price forecasting, financial sentiment parsing, and portfolio optimization.

## Directory Structure

- `app/main.py`: Application entrypoint exposing endpoints for forecasts, sentiments, and portfolio analysis.
- `app/config.py`: Environment configuration and settings loading.
- `app/services/`: Core logic:
  - `forecast.py`: Regressive models (XGBoost, Linear Regression, or LSTM) for asset prices.
  - `sentiment.py`: Natural language processing (Vader or transformers-based sentiment scoring).
  - `optimizer.py`: Modern Portfolio Theory (MPT) logic for generating efficient frontiers.
- `app/models/`: Serialized models or model weights (if persistent).
