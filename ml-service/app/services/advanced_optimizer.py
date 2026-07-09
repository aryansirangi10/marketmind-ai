# ==============================================================================
# Advanced Portfolio Optimization Service (Black-Litterman & Risk Parity)
# ==============================================================================

import numpy as np
from typing import List, Dict, Any

class AdvancedOptimizer:
    """
    Quantitative optimization algorithms including Black-Litterman and Risk Parity
    """
    
    @staticmethod
    def calculate_risk_parity(cov_matrix: List[List[float]], asset_names: List[str]) -> Dict[str, Any]:
        """
        Calculates weights such that the risk contribution of each asset is equalized.
        Using a standard numeric approximation: w_i is proportional to 1 / std_dev_i
        """
        cov = np.array(cov_matrix)
        std_devs = np.sqrt(np.diag(cov))
        
        # Risk parity weight is inversely proportional to standard deviation (volatility)
        inv_vols = 1.0 / (std_devs + 1e-8)
        weights = inv_vols / np.sum(inv_vols)
        
        # Calculate risk contributions
        port_variance = weights.T @ cov @ weights
        port_vol = np.sqrt(port_variance)
        marginal_risk = (cov @ weights) / (port_vol + 1e-8)
        risk_contributions = weights * marginal_risk
        
        return {
            "method": "Risk Parity (Equal Risk Contribution)",
            "weights": {name: float(w) for name, w in zip(asset_names, weights)},
            "risk_contributions": {name: float(rc / np.sum(risk_contributions)) for name, rc in zip(asset_names, risk_contributions)},
            "portfolio_volatility": float(port_vol)
        }

    @staticmethod
    def calculate_black_litterman(
        returns: List[float], 
        cov_matrix: List[List[float]], 
        asset_names: List[str],
        user_views: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Implements Black-Litterman formula updating market returns with active investor views
        """
        cov = np.array(cov_matrix)
        pi = np.array(returns) # Market implied returns
        
        num_assets = len(asset_names)
        if num_assets == 0:
            return {"weights": {}, "expected_returns": {}}

        # Map views (P matrix represents links to assets, Q is views returns)
        p_matrix = []
        q_vector = []
        
        for asset, view_return in user_views.items():
            if asset in asset_names:
                idx = asset_names.index(asset)
                row = np.zeros(num_assets)
                row[idx] = 1.0
                p_matrix.append(row)
                q_vector.append(view_return)
                
        if len(p_matrix) == 0:
            # Fallback to standard Mean-Variance if no views are mapped
            inv_cov = np.linalg.inv(cov + np.eye(num_assets) * 1e-6)
            ones = np.ones(num_assets)
            weights = (inv_cov @ pi) / (ones.T @ inv_cov @ pi + 1e-8)
            weights = np.clip(weights, 0, 1)
            weights = weights / np.sum(weights)
            return {
                "method": "Black-Litterman (No Views / Market Equilibrium)",
                "weights": {name: float(w) for name, w in zip(asset_names, weights)},
                "expected_returns": {name: float(r) for name, r in zip(asset_names, pi)}
            }
            
        P = np.array(p_matrix)
        Q = np.array(q_vector)
        
        tau = 0.05
        omega = np.diag(np.diag(P @ (tau * cov) @ P.T)) # Uncertainty of views
        
        # Black-Litterman formula:
        # E(R) = [ (tau * Sigma)^-1 + P^T * Omega^-1 * P ]^-1 * [ (tau * Sigma)^-1 * Pi + P^T * Omega^-1 * Q ]
        inv_tau_sigma = np.linalg.inv(tau * cov + np.eye(num_assets) * 1e-6)
        inv_omega = np.linalg.inv(omega + np.eye(len(Q)) * 1e-6)
        
        post_cov = np.linalg.inv(inv_tau_sigma + P.T @ inv_omega @ P + np.eye(num_assets) * 1e-6)
        post_returns = post_cov @ (inv_tau_sigma @ pi + P.T @ inv_omega @ Q)
        
        # Mean-Variance weights using posterior returns
        inv_cov = np.linalg.inv(cov + np.eye(num_assets) * 1e-6)
        weights = inv_cov @ post_returns
        weights = np.clip(weights, 0, 1)
        weights = weights / (np.sum(weights) + 1e-8)
        
        return {
            "method": "Black-Litterman (Views Combined)",
            "weights": {name: float(w) for name, w in zip(asset_names, weights)},
            "expected_returns": {name: float(r) for name, r in zip(asset_names, post_returns)}
        }
