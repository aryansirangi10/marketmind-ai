// ==============================================================================
// Mock AI Provider Implementation
// ==============================================================================

import { IAIProvider, ChatMessage, SentimentAnalysisResult } from "../../../domain/providers/ai-provider.interface";

export class MockAIProvider implements IAIProvider {
  public async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const query = lastMessage.toUpperCase();

    // Smart contextual mock answers
    if (query.includes("AAPL") || query.includes("APPLE")) {
      return "Apple Inc. (AAPL) is currently showing strong fundamentals. With a market cap of over $3.1T and steady demand in services, it remains a defensive technology pick. Technically, AAPL is trading near its 50-day moving average, representing a key support level. Analysts cite potential growth in consumer electronics powered by edge-AI features as a catalyst for Q3.";
    }

    if (query.includes("BTC") || query.includes("BITCOIN")) {
      return "Bitcoin (BTC) is demonstrating significant bullish momentum, consolidating above the $65,000 mark. Institutional inflows via spot ETFs are providing a robust floor. Keep an eye on MACD crossovers on the daily chart; a sustained breakout past $68,000 could open the path toward $72,000, while a drop below $62,000 is a critical support zone.";
    }

    if (query.includes("TSLA") || query.includes("TESLA")) {
      return "Tesla (TSLA) is currently experiencing high volatility. The market is pricing in regulatory headwinds and margin compressions from pricing shifts. However, long-term drivers such as their self-driving beta releases and energy storage business present substantial upside. Major support lies around $165, and resistance is marked at $195.";
    }

    if (query.includes("PORTFOLIO") || query.includes("OPTIMIZE") || query.includes("RISK")) {
      return "Based on your current portfolio configuration, you have a high concentration in technology and crypto assets. To optimize your risk-adjusted returns (Sharpe Ratio), I recommend diversifying into defensive sectors (Healthcare or Consumer Staples) or short-duration treasuries. Your overall Portfolio Health Score is currently 78/100, indicating good performance with moderate-to-high downside risk.";
    }

    return "Hello! I am your MarketMind AI financial assistant. I can help you analyze stock profiles (e.g. AAPL, NVDA), cryptocurrency trends (e.g. BTC, ETH), news sentiment, or review your portfolio allocations. What asset would you like to review today?";
  }

  public async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    const query = text.toLowerCase();
    
    // Heuristic sentiment scoring
    let score = 0.0;
    let label: "positive" | "negative" | "neutral" = "neutral";
    let explanation = "The text maintains a neutral stance regarding market conditions.";

    const positiveWords = ["rally", "outperform", "spike", "gains", "jump", "surge", "growth", "bullish", "record", "cuts", "breakout"];
    const negativeWords = ["drop", "investigation", "concerns", "selling", "pressure", "decline", "fall", "bearish", "congestions", "charges", "warning", "headwinds"];

    let posCount = 0;
    let negCount = 0;

    positiveWords.forEach(w => {
      if (query.includes(w)) posCount++;
    });

    negativeWords.forEach(w => {
      if (query.includes(w)) negCount++;
    });

    if (posCount > negCount) {
      score = Number((0.2 + (posCount - negCount) * 0.15).toFixed(2));
      score = Math.min(score, 1.0);
      label = "positive";
      explanation = `The text contains optimistic cues (${posCount} positive tokens), signaling a constructive market sentiment.`;
    } else if (negCount > posCount) {
      score = Number((-0.2 - (negCount - posCount) * 0.15).toFixed(2));
      score = Math.max(score, -1.0);
      label = "negative";
      explanation = `The text flags caution and concern (${negCount} negative tokens), reflecting risk-off or bearish sentiment.`;
    }

    return {
      score,
      label,
      explanation
    };
  }

  public async summarizeText(text: string): Promise<string> {
    if (text.length < 100) return text;
    return `Summary: Key takeaways highlight that market participants are closely monitoring macro indicators (specifically interest rates and corporate earnings releases). Technical levels for major indices remain intact, but short-term volatility is anticipated due to regulatory updates and sectoral reallocation.`;
  }
}
