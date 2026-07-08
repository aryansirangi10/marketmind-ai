# ==============================================================================
# ML Price Forecasting Service (Autoregressive Ridge Regression)
# ==============================================================================

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from typing import List

def predict_prices(historical_prices: List[float], days_to_forecast: int = 7) -> List[float]:
    """
    Predicts the next N days of asset prices using a Ridge Regression model
    fitted on lag features and rolling averages. Falls back to a linear trend
    if historical data points are insufficient.
    """
    n_points = len(historical_prices)
    
    if n_points < 10:
        # Insufficient data to train regressor - fallback to simple linear drift
        if n_points < 2:
            return [historical_prices[-1] if n_points > 0 else 100.0] * days_to_forecast
        
        slope = (historical_prices[-1] - historical_prices[0]) / (n_points - 1)
        last_val = historical_prices[-1]
        return [float(last_val + slope * (i + 1)) for i in range(days_to_forecast)]

    # 1. Feature Engineering
    df = pd.DataFrame({"close": historical_prices})
    
    # Lags
    df["lag_1"] = df["close"].shift(1)
    df["lag_2"] = df["close"].shift(2)
    df["lag_3"] = df["close"].shift(3)
    
    # Rolling averages
    df["roll_mean_3"] = df["close"].shift(1).rolling(window=3).mean()
    df["roll_mean_5"] = df["close"].shift(1).rolling(window=5).mean()
    
    # Drop rows with NaN due to lagging
    df_clean = df.dropna()
    
    if len(df_clean) < 5:
        # Fallback if cleaning removed too many rows
        slope = (historical_prices[-1] - historical_prices[0]) / (n_points - 1)
        last_val = historical_prices[-1]
        return [float(last_val + slope * (i + 1)) for i in range(days_to_forecast)]

    X = df_clean[["lag_1", "lag_2", "lag_3", "roll_mean_3", "roll_mean_5"]].values
    y = df_clean["close"].values

    # 2. Model Training
    model = Ridge(alpha=1.0)
    model.fit(X, y)

    # 3. Autoregressive Multistep Forecast
    current_series = list(historical_prices)
    predictions: List[float] = []

    for _ in range(days_to_forecast):
        # Build features for the latest step
        lag_1 = current_series[-1]
        lag_2 = current_series[-2]
        lag_3 = current_series[-3]
        
        roll_3 = np.mean(current_series[-3:])
        roll_5 = np.mean(current_series[-5:])
        
        features = np.array([[lag_1, lag_2, lag_3, roll_3, roll_5]])
        
        # Predict t+1
        pred = float(model.predict(features)[0])
        
        # Prevent negative prices
        pred = max(pred, 0.01)
        
        predictions.append(pred)
        current_series.append(pred)

    return predictions
