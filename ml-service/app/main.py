# ==============================================================================
# ML Service Main API (FastAPI Application Gateway)
# ==============================================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from app.services.forecast import ForecastingEngine
from app.services.advanced_optimizer import AdvancedOptimizer
from app.services.sentiment_analyzer import SentimentAnalyzer
from app.services.indicators import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_bollinger_bands,
    calculate_macd
)
from app.config import settings

app = FastAPI(
    title=settings.app_name,
    description="Machine Learning price projections, NLP sentiment, and Modern Portfolio optimizations."
)

forecast_engine = ForecastingEngine()

# ------------------------------------------------------------------------------
# API Schema Definition (Pydantic Models)
# ------------------------------------------------------------------------------
class ForecastRequest(BaseModel):
    prices: List[float] = Field(..., description="Chronological sequence of closing price valuations")
    days: int = Field(7, description="Number of future intervals to forecast ahead", ge=1, le=30)
    model: str = Field("random_forest", description="Prediction model type (lstm, prophet, random_forest)")

class SentimentRequest(BaseModel):
    text: str = Field(..., description="Headline or text context to analyze")
    symbol: Optional[str] = Field(None, description="Related asset symbol filter")

class AdvancedOptimizeRequest(BaseModel):
    returns: List[float] = Field(..., description="Market equilibrium return weights")
    cov_matrix: List[List[float]] = Field(..., description="Covariance variance matrix coordinates")
    asset_names: List[str] = Field(..., description="Names of stock/crypto constituent tickers")
    user_views: Dict[str, float] = Field(default_factory=dict, description="Active view return offsets")
    method: str = Field("risk_parity", description="Optimization methodology (risk_parity, black_litterman)")

class IndicatorsRequest(BaseModel):
    prices: List[float] = Field(..., description="Chronological sequence of closing price valuations")

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
    Computes autoregressive asset price predictions using selected model
    """
    if len(request.prices) == 0:
        raise HTTPException(status_code=400, detail="Historical prices list cannot be empty.")
    try:
        forecasted = forecast_engine.generate_forecast(request.model, request.prices, request.days)
        return {"success": True, "data": forecasted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine error: {str(e)}")

@app.post("/sentiment/analyze")
def sentiment_route(request: SentimentRequest):
    """
    Calculates natural language financial sentiment and impact metrics
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text contents cannot be empty.")
    try:
        report = SentimentAnalyzer.analyze_text(request.text, request.symbol)
        return {"success": True, "data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analyzer engine error: {str(e)}")

@app.post("/optimize/advanced")
def optimize_route(request: AdvancedOptimizeRequest):
    """
    Solves weights optimization using Black-Litterman views integration or Risk Parity
    """
    if not request.asset_names:
        raise HTTPException(status_code=400, detail="Asset names list cannot be empty.")
    try:
        if request.method.lower() == "black_litterman":
            result = AdvancedOptimizer.calculate_black_litterman(
                request.returns,
                request.cov_matrix,
                request.asset_names,
                request.user_views
            )
        else:
            result = AdvancedOptimizer.calculate_risk_parity(
                request.cov_matrix,
                request.asset_names
            )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced optimizer engine error: {str(e)}")

@app.post("/indicators")
def indicators_route(request: IndicatorsRequest):
    """
    Computes standard mathematical technical indicators (SMA, EMA, RSI, BB, MACD)
    """
    if len(request.prices) == 0:
        raise HTTPException(status_code=400, detail="Historical prices list cannot be empty.")
    try:
        sma_20 = calculate_sma(request.prices, 20)
        ema_20 = calculate_ema(request.prices, 20)
        rsi_14 = calculate_rsi(request.prices, 14)
        bb_20 = calculate_bollinger_bands(request.prices, 20)
        macd = calculate_macd(request.prices)
        
        return {
            "success": True,
            "indicators": {
                "sma_20": sma_20,
                "ema_20": ema_20,
                "rsi_14": rsi_14,
                "bollinger_bands_20": bb_20,
                "macd": macd
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Technical indicators engine error: {str(e)}")
