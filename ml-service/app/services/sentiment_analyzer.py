# ==============================================================================
# Financial NLP Sentiment Analyzer (VADER-inspired / Dictionary-based)
# ==============================================================================

import re
from typing import Dict, List, Any

class SentimentAnalyzer:
    """
    Financial NLP parser evaluating sentiment impact scores (-1.0 to +1.0)
    and ticker relevance weights.
    """
    
    # Financial sentiment lexicon
    BULLISH_WORDS = {
        "outperform", "growth", "breakout", "surpassed", "beat", "rally", "upgrade",
        "bullish", "profit", "gain", "optimistic", "high", "positive", "dividend",
        "success", "expansion", "soars", "acquisition", "surge", "earnings"
    }
    
    BEARISH_WORDS = {
        "underperform", "decline", "crash", "missed", "drop", "selloff", "downgrade",
        "bearish", "loss", "deficit", "pessimistic", "low", "negative", "risk",
        "failure", "contraction", "plummets", "lawsuit", "layoffs", "inflation"
    }

    @classmethod
    def analyze_text(cls, text: str, symbol: str = None) -> Dict[str, Any]:
        """
        Calculates sentiment scores based on word match frequency.
        """
        words = re.findall(r'\b\w+\b', text.lower())
        if not words:
            return {"score": 0.0, "label": "neutral", "impact": 0.0}
            
        pos_count = sum(1 for w in words if w in cls.BULLISH_WORDS)
        neg_count = sum(1 for w in words if w in cls.BEARISH_WORDS)
        
        # Calculate raw score (-1 to 1)
        total_matched = pos_count + neg_count
        if total_matched == 0:
            score = 0.0
            label = "neutral"
        else:
            score = (pos_count - neg_count) / total_matched
            if score > 0.15:
                label = "positive"
            elif score < -0.15:
                label = "negative"
            else:
                label = "neutral"
                
        # Calculate market relevance and impact score
        relevance = 1.0
        if symbol:
            # Check for symbol occurrences in text
            occurrences = len(re.findall(rf'\b{symbol.lower()}\b', text.lower()))
            relevance = min(1.0, occurrences * 0.5 + 0.1) if occurrences > 0 else 0.1
            
        impact = score * relevance
        
        return {
            "score": float(round(score, 2)),
            "label": label,
            "relevance": float(round(relevance, 2)),
            "impact": float(round(impact, 2))
        }

    @classmethod
    def analyze_news_hub(cls, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Batch processes news items and appends impact scores
        """
        processed = []
        for item in items:
            headline = item.get("title", "")
            summary = item.get("summary", "")
            symbol = item.get("symbol", None)
            
            combined_text = f"{headline} {summary}"
            analysis = cls.analyze_text(combined_text, symbol)
            
            processed.append({
                **item,
                "sentimentScore": analysis["score"],
                "sentimentLabel": analysis["label"],
                "relevanceRank": analysis["relevance"],
                "impactScore": analysis["impact"]
            })
            
        # Sort by relevance and impact
        return sorted(processed, key=lambda x: abs(x["impactScore"]), reverse=True)
