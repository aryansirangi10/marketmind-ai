# ==============================================================================
# ML Service Main API (FastAPI Application Gateway)
# ==============================================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict
from app.services.forecast import predict_prices
from app.services.sentiment import analyze_headlines
from app.services.optimizer import optimize_portfolio
from app.config import settings

app = FastAPI(
    title=settings.app_name,
    description="Machine Learning price projections, NLP sentiment, and Modern Portfolio optimizations."
)

# ------------------------------------------------------------------------------
# API Schema Definition (Pydantic Models)
# ------------------------------------------------------------------------------
class ForecastRequest(BaseModel):
    prices: List[float] = Field(..., description="Chronological sequence of closing price valuations")
    days: int = Field(7, description="Number of future intervals to forecast ahead", ge=1, le=30)

class SentimentRequest(BaseModel):
    headlines: List[str] = Field(..., description="Financial titles or content articles to score")

class OptimizeRequest(BaseModel):
    assets: Dict[str, List[float]] = Field(..., description="Symbol maps referencing historic price series")
    risk_free_rate: float = Field(0.02, description="Yield benchmark for cash positions")

# ------------------------------------------------------------------------------
# Route Controllers
# ------------------------------------------------------------------------------
@app.get("/health")
def health_check():
    """
    Returns API status metrics
    """
    return {
        "status": "UP",
        "service": settings.app_name,
        "environment": settings.env
    }

@app.post("/forecast")
def forecast_route(request: ForecastRequest):
    """
    Computes autoregressive asset price predictions
    """
    if len(request.prices) == 0:
        raise HTTPException(status_code=400, detail="Historical prices list cannot be empty.")
    try:
        forecasted = predict_prices(request.prices, request.days)
        return {"success": True, "predictions": forecasted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine error: {str(e)}")

@app.post("/sentiment")
def sentiment_route(request: SentimentRequest):
    """
    Calculates natural language finance sentiment aggregate metrics
    """
    if len(request.headlines) == 0:
        raise HTTPException(status_code=400, detail="News headlines list cannot be empty.")
    try:
        report = analyze_headlines(request.headlines)
        return {"success": True, "data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analyzer engine error: {str(e)}")

@app.post("/optimize")
def optimize_route(request: OptimizeRequest):
    """
    Solves optimal weights using Markowitz Modern Portfolio Theory (MPT)
    """
    if len(request.assets) == 0:
        raise HTTPException(status_code=400, detail="Assets historical data maps cannot be empty.")
    try:
        allocations = optimize_portfolio(request.assets, request.risk_free_rate)
        return {"success": True, "data": allocations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio optimizer engine error: {str(e)}")
