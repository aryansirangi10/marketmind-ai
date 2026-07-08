# ==============================================================================
# Technical Indicator Calculations (Pandas / NumPy)
# ==============================================================================

import pandas as pd
import numpy as np
from typing import List, Dict, Any

def calculate_sma(prices: List[float], window: int) -> List[float]:
    """Calculates Simple Moving Average (SMA)."""
    if len(prices) < window:
        return [float('nan')] * len(prices)
    df = pd.Series(prices)
    return df.rolling(window=window).mean().tolist()

def calculate_ema(prices: List[float], window: int) -> List[float]:
    """Calculates Exponential Moving Average (EMA)."""
    if len(prices) < window:
        return [float('nan')] * len(prices)
    df = pd.Series(prices)
    return df.ewm(span=window, adjust=False).mean().tolist()

def calculate_rsi(prices: List[float], window: int = 14) -> List[float]:
    """Calculates Relative Strength Index (RSI)."""
    if len(prices) <= window:
        return [float('nan')] * len(prices)
    
    df = pd.Series(prices)
    delta = df.diff()
    
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    
    # Replace nan at start with standard nulls
    return [x if not np.isnan(x) else None for x in rsi.tolist()] # type: ignore

def calculate_bollinger_bands(prices: List[float], window: int = 20, num_std: float = 2.0) -> Dict[str, List[Any]]:
    """Calculates Bollinger Bands (Upper, Middle, Lower)."""
    if len(prices) < window:
        empty = [None] * len(prices)
        return {"upper": empty, "middle": empty, "lower": empty}
    
    df = pd.Series(prices)
    middle = df.rolling(window=window).mean()
    std = df.rolling(window=window).std()
    
    upper = middle + (std * num_std)
    lower = middle - (std * num_std)
    
    return {
        "upper": [x if not np.isnan(x) else None for x in upper.tolist()],
        "middle": [x if not np.isnan(x) else None for x in middle.tolist()],
        "lower": [x if not np.isnan(x) else None for x in lower.tolist()],
    }

def calculate_macd(prices: List[float], fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, List[Any]]:
    """Calculates Moving Average Convergence Divergence (MACD)."""
    if len(prices) < slow:
        empty = [None] * len(prices)
        return {"macd": empty, "signal": empty, "histogram": empty}
    
    df = pd.Series(prices)
    ema_fast = df.ewm(span=fast, adjust=False).mean()
    ema_slow = df.ewm(span=slow, adjust=False).mean()
    
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    
    return {
        "macd": [x if not np.isnan(x) else None for x in macd_line.tolist()],
        "signal": [x if not np.isnan(x) else None for x in signal_line.tolist()],
        "histogram": [x if not np.isnan(x) else None for x in histogram.tolist()],
    }
