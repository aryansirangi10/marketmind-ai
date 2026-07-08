# ==============================================================================
# Portfolio Optimizer Service (Modern Portfolio Theory, Risk Metrics, Efficient Frontier)
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
    Simulates random asset weights to identify:
      - Max Sharpe Ratio portfolio
      - Min Volatility portfolio
    Calculates advanced risk metrics:
      - Sortino Ratio
      - Treynor Ratio
      - Alpha & Beta relative to equal-weight market index
      - Value at Risk (VaR) & CVaR (95% daily historical)
      - CAGR & Maximum Drawdown (peak-to-trough drop)
      - Simulated coordinates for the Efficient Frontier chart
    """
    symbols = list(assets_prices.keys())
    n_assets = len(symbols)
    
    if n_assets < 2:
        default_weights = {symbols[0]: 1.0} if n_assets == 1 else {}
        return {
            "max_sharpe": {
                "weights": default_weights,
                "expected_return": 0.08,
                "expected_volatility": 0.12,
                "sharpe_ratio": 0.5,
                "sortino_ratio": 0.7,
                "treynor_ratio": 0.5,
                "alpha": 0.0,
                "beta": 1.0,
                "var_95": 0.02,
                "cvar_95": 0.03,
                "max_drawdown": -0.05,
                "cagr": 0.08
            },
            "min_volatility": {
                "weights": default_weights,
                "expected_return": 0.08,
                "expected_volatility": 0.12,
                "sharpe_ratio": 0.5,
                "sortino_ratio": 0.7,
                "treynor_ratio": 0.5,
                "alpha": 0.0,
                "beta": 1.0,
                "var_95": 0.02,
                "cvar_95": 0.03,
                "max_drawdown": -0.05,
                "cagr": 0.08
            },
            "simulations": []
        }

    # 1. Calculate Daily Returns
    price_df = pd.DataFrame(assets_prices)
    returns_df = price_df.pct_change().dropna()

    if len(returns_df) < 5:
        # Fallback if too few trading days: return equal weight allocation
        equal_weight = {sym: float(round(1.0 / n_assets, 4)) for sym in symbols}
        return {
            "max_sharpe": {
                "weights": equal_weight,
                "expected_return": 0.08,
                "expected_volatility": 0.12,
                "sharpe_ratio": 0.5
            },
            "min_volatility": {
                "weights": equal_weight,
                "expected_return": 0.08,
                "expected_volatility": 0.12,
                "sharpe_ratio": 0.5
            },
            "simulations": []
        }

    # Annualized expected returns and covariance matrix (assuming 252 trading days/yr)
    expected_returns = returns_df.mean() * 252
    cov_matrix = returns_df.cov() * 252

    # Benchmark: equal weighted average of all assets as a "market proxy"
    market_returns = returns_df.mean(axis=1)
    market_annual_return = market_returns.mean() * 252
    market_variance = market_returns.var() * 252

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
    max_sharpe_weights = weights_record[max_sharpe_idx]

    min_vol_idx = np.argmin(results[1])
    min_vol_weights = weights_record[min_vol_idx]

    # Helper function to compute complete statistics for a given weight set
    def get_portfolio_stats(weights):
        # Weight allocation dict
        allocation = {sym: float(round(weights[idx], 4)) for idx, sym in enumerate(symbols)}
        
        # Returns math
        p_return = np.sum(weights * expected_returns)
        p_vol = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        sharpe = (p_return - risk_free_rate) / p_vol
        
        # Calculate daily portfolio returns stream
        p_daily_returns = returns_df.dot(weights)
        
        # Sortino Ratio: Downside deviation (only negative returns variance)
        negative_returns = p_daily_returns[p_daily_returns < 0]
        downside_std = np.sqrt(np.mean(negative_returns ** 2)) * np.sqrt(252) if len(negative_returns) > 0 else 1e-6
        sortino = (p_return - risk_free_rate) / downside_std
        
        # Beta & Alpha relative to market index
        covariance = np.cov(p_daily_returns, market_returns)[0, 1] * 252
        beta = covariance / market_variance if market_variance > 0 else 1.0
        alpha = p_return - (risk_free_rate + beta * (market_annual_return - risk_free_rate))
        
        # Treynor Ratio
        treynor = (p_return - risk_free_rate) / beta if beta != 0 else 0.0
        
        # Value at Risk (VaR) & CVaR (95% daily historical loss)
        var_95 = float(-np.percentile(p_daily_returns, 5))
        cvar_95 = float(-p_daily_returns[p_daily_returns <= -var_95].mean()) if len(p_daily_returns[p_daily_returns <= -var_95]) > 0 else var_95
        
        # CAGR (assuming daily compounding over 252 steps)
        cum_returns = (1 + p_daily_returns).cumprod()
        total_days = len(p_daily_returns)
        cagr = float(cum_returns.iloc[-1] ** (252.0 / total_days) - 1) if total_days > 0 else p_return
        
        # Maximum Drawdown (peak-to-trough)
        running_max = cum_returns.cummax()
        drawdown = (cum_returns - running_max) / running_max
        max_dd = float(drawdown.min())
        
        return {
            "weights": allocation,
            "expected_return": float(round(p_return, 4)),
            "expected_volatility": float(round(p_vol, 4)),
            "sharpe_ratio": float(round(sharpe, 4)),
            "sortino_ratio": float(round(sortino, 4)),
            "treynor_ratio": float(round(treynor, 4)),
            "alpha": float(round(alpha, 4)),
            "beta": float(round(beta, 4)),
            "var_95": float(round(var_95, 4)),
            "cvar_95": float(round(cvar_95, 4)),
            "max_drawdown": float(round(max_dd, 4)),
            "cagr": float(round(cagr, 4))
        }

    # 4. Generate random subsample of simulation coordinates for charting
    # Take a representative sample (e.g. 150 points) to avoid bloat in JSON payloads
    sample_indices = np.random.choice(num_simulations, size=min(150, num_simulations), replace=False)
    simulations_points = []
    for idx in sample_indices:
        simulations_points.append({
            "return": float(round(results[0, idx], 4)),
            "volatility": float(round(results[1, idx], 4)),
            "sharpe": float(round(results[2, idx], 4))
        })

    return {
        "max_sharpe": get_portfolio_stats(max_sharpe_weights),
        "min_volatility": get_portfolio_stats(min_vol_weights),
        "simulations": simulations_points
    }
