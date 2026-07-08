# ==============================================================================
# Financial Sentiment Analysis Service (Lexicon-Based Analyzer)
# ==============================================================================

import re
from typing import List, Dict, Any

# Financial Lexicon Maps
FINANCIAL_POSITIVE_WORDS = {
    "bullish", "surge", "gain", "rally", "profit", "beat", "dividend", 
    "growth", "expand", "record", "upgrade", "outperform", "buy", "positive",
    "success", "earnings", "bounce", "soar", "acquisition", "partnership"
}

FINANCIAL_NEGATIVE_WORDS = {
    "bearish", "plummet", "drop", "slump", "loss", "miss", "debt", 
    "downgrade", "underperform", "sell", "negative", "warns", "lawsuit", 
    "decline", "fall", "crash", "slashed", "deficit", "probe", "investigation"
}

def analyze_headlines(headlines: List[str]) -> Dict[str, Any]:
    """
    Scans a list of financial headlines, identifying positive and negative indicators
    to output normalized sentiment metrics.
    """
    total_positive = 0
    total_negative = 0
    total_words = 0
    
    scored_headlines = []

    for headline in headlines:
        # Tokenize and normalize
        words = re.findall(r"\b\w+\b", headline.lower())
        pos_count = 0
        neg_count = 0
        
        for word in words:
            total_words += 1
            if word in FINANCIAL_POSITIVE_WORDS:
                pos_count += 1
            elif word in FINANCIAL_NEGATIVE_WORDS:
                neg_count += 1
        
        # Headline sentiment category
        headline_score = pos_count - neg_count
        sentiment_label = "NEUTRAL"
        if headline_score > 0:
            sentiment_label = "POSITIVE"
        elif headline_score < 0:
            sentiment_label = "NEGATIVE"
            
        scored_headlines.append({
            "headline": headline,
            "label": sentiment_label,
            "score": float(headline_score)
        })
        
        total_positive += pos_count
        total_negative += neg_count

    # Calculate overall aggregate sentiment score
    # Normalized between -1.0 (very negative) and +1.0 (very positive)
    divisor = total_positive + total_negative
    aggregate_score = (total_positive - total_negative) / divisor if divisor > 0 else 0.0

    # Categorize aggregate label
    if aggregate_score > 0.15:
        overall_label = "BULLISH"
    elif aggregate_score < -0.15:
        overall_label = "BEARISH"
    else:
        overall_label = "NEUTRAL"

    return {
        "score": float(round(aggregate_score, 4)),
        "label": overall_label,
        "metrics": {
            "positive_hits": total_positive,
            "negative_hits": total_negative,
            "headlines_count": len(headlines)
        },
        "breakdown": scored_headlines
    }
