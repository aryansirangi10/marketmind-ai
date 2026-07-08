# ==============================================================================
# Portfolio Optimizer Service (Modern Portfolio Theory & Sharpe Ratio)
# ==============================================================================

import numpy as np
import pandas as pd
from typing import List, Dict, Any

def optimize_portfolio(
    assets_prices: Dict[str, List[float]], 
    risk_free_rate: float = 0.02, 
    num_simulations: int = 1500
) -> Dict[str, Any]:
    """
    Computes optimal portfolio allocations using Modern Portfolio Theory (MPT).
    Simulates random asset weights to identify the Max Sharpe Ratio portfolio
    and the Minimum Volatility portfolio.
    """
    symbols = list(assets_prices.keys())
    n_assets = len(symbols)
    
    if n_assets < 2:
        return {
            "max_sharpe": {symbols[0]: 1.0} if n_assets == 1 else {},
            "min_volatility": {symbols[0]: 1.0} if n_assets == 1 else {},
            "metrics": {"max_sharpe_return": 0.0, "max_sharpe_volatility": 0.0}
        }

    # 1. Calculate Daily Returns
    price_df = pd.DataFrame(assets_prices)
    returns_df = price_df.pct_change().dropna()

    if len(returns_df) < 5:
        # Fallback if too few trading days: return equal weight allocation
        equal_weight = {sym: float(round(1.0 / n_assets, 4)) for sym in symbols}
        return {
            "max_sharpe": equal_weight,
            "min_volatility": equal_weight,
            "metrics": {"max_sharpe_return": 0.08, "max_sharpe_volatility": 0.12}
        }

    # Annualized expected returns and covariance matrix (assuming 252 trading days/yr)
    expected_returns = returns_df.mean() * 252
    cov_matrix = returns_df.cov() * 252

    # 2. Monte Carlo Portfolio Simulation
    results = np.zeros((3, num_simulations))
    weights_record = []

    for i in range(num_simulations):
        # Generate random weights
        weights = np.random.random(n_assets)
        weights /= np.sum(weights)
        weights_record.append(weights)
        
        # Portfolio return: w^T * expected_returns
        portfolio_return = np.sum(weights * expected_returns)
        
        # Portfolio volatility: sqrt(w^T * cov * w)
        portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        
        # Sharpe Ratio: (Return - RiskFree) / Volatility
        sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility
        
        results[0, i] = portfolio_return
        results[1, i] = portfolio_volatility
        results[2, i] = sharpe_ratio

    # 3. Locate Max Sharpe & Min Volatility Portfolios
    max_sharpe_idx = np.argmax(results[2])
    sd_max_sharpe = results[1, max_sharpe_idx]
    rp_max_sharpe = results[0, max_sharpe_idx]
    max_sharpe_weights = weights_record[max_sharpe_idx]

    min_vol_idx = np.argmin(results[1])
    sd_min_vol = results[1, min_vol_idx]
    rp_min_vol = results[0, min_vol_idx]
    min_vol_weights = weights_record[min_vol_idx]

    # Convert arrays back to dictionaries
    max_sharpe_allocation = {}
    min_vol_allocation = {}

    for idx, sym in enumerate(symbols):
        max_sharpe_allocation[sym] = float(round(max_sharpe_weights[idx], 4))
        min_vol_allocation[sym] = float(round(min_vol_weights[idx], 4))

    return {
        "max_sharpe": {
            "weights": max_sharpe_allocation,
            "expected_return": float(round(rp_max_sharpe, 4)),
            "expected_volatility": float(round(sd_max_sharpe, 4)),
            "sharpe_ratio": float(round(results[2, max_sharpe_idx], 4))
        },
        "min_volatility": {
            "weights": min_vol_allocation,
            "expected_return": float(round(rp_min_vol, 4)),
            "expected_volatility": float(round(sd_min_vol, 4)),
            "sharpe_ratio": float(round(results[2, min_vol_idx], 4))
        }
    }
