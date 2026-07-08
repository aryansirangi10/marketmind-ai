# ==============================================================================
# Production Dockerfile for MarketMind ML Service (Python FastAPI)
# ==============================================================================

FROM python:3.11-slim

WORKDIR /app

# Install compilation build essentials for Python packages (XGBoost/scikit-learn)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency mappings
COPY requirements.txt ./

# Install pip requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy service source code
COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
