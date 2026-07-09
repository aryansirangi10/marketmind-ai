// ==============================================================================
// Mock AI Provider Implementation
// ==============================================================================

import { IAIProvider, ChatMessage, SentimentAnalysisResult } from "../../../domain/providers/ai-provider.interface";

export class MockAIProvider implements IAIProvider {
  public async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const query = lastMessage.toUpperCase();

    // Smart contextual mock answers
    if (query.includes("RELIANCE") || query.includes("RIL")) {
      return "Reliance Industries Limited (RELIANCE) is showing strong fundamentals. With a market cap of over ₹16.8T and diversified growth in retail, telecom (Jio), and green energy, it remains a pillar technology/energy pick. Technically, RELIANCE is trading near its 50-day moving average, representing a key support level. Analysts cite potential value unlocking from retail/telecom IPOs as a catalyst.";
    }

    if (query.includes("BTC") || query.includes("BITCOIN")) {
      return "Bitcoin (BTC) is demonstrating significant bullish momentum, consolidating above the $65,000 mark. Institutional inflows via spot ETFs are providing a robust floor. Keep an eye on MACD crossovers on the daily chart; a sustained breakout past $68,000 could open the path toward $72,000, while a drop below $62,000 is a critical support zone.";
    }

    if (query.includes("TCS") || query.includes("TATA")) {
      return "Tata Consultancy Services (TCS) is currently showing stable performance. Although the IT sector faces general global spend headwinds, TCS maintains high margins and high order books. Long-term tailwinds from enterprise generative AI integrations and cloud migrations remain robust. Major support lies around ₹3750, and resistance is marked at ₹3950.";
    }

    if (query.includes("NIFTY") || query.includes("SENSEX") || query.includes("INDEX") || query.includes("MARKET MOVEMENT")) {
      return "The Nifty 50 Index has shown strong structural momentum, holding above the 23,500 support level. The index trend remains constructive as long as it consolidates above the 50-day Exponential Moving Average (EMA). Sectoral leadership is rotational: while Banking (Bank Nifty) provides valuation safety, tech (IT Index) and autos (Auto Index) are acting as growth drivers. Exercise caution if India VIX spikes above 16.0.";
    }

    if (query.includes("SECTOR") || query.includes("ROTATION")) {
      return "We are observing structural sector rotation in the Indian market. Capital is shifting from overvalued public sector undertakings (PSU Banks, Defence, Railways) and rotating back into high-quality private sector banks, consumer goods (FMCG), and IT services. FMCG acts as a defensive shield during global volatility, while Capital Goods and Infrastructure show high beta and strong multi-year order pipelines.";
    }

    if (query.includes("RBI") || query.includes("RATE") || query.includes("MONETARY POLICY")) {
      return "The Reserve Bank of India (RBI) Monetary Policy Committee (MPC) has kept the repo rate unchanged at 6.50% to align headline inflation with the 4.00% target. Analysts anticipate a potential 25 bps rate cut in late Q4 FY26 if food inflation cools down. A rate cut will act as a major catalyst for rate-sensitive sectors, specifically Real Estate (Realty Index), Automobiles, and Banking.";
    }

    if (query.includes("BUDGET") || query.includes("GOVERNMENT POLICY") || query.includes("UNION BUDGET")) {
      return "Government policy updates and the upcoming Union Budget remain heavily focused on capital expenditure. Priority areas include public infrastructure (Highways, Smart Cities, Metro links), defense indigenization (benefiting HAL, BEL, BDL), green energy (Adani Green, Tata Power), and railway modernization (benefiting RVNL, IRFC). Watch for changes in capital gains tax brackets, which directly affect retail market liquidity.";
    }

    if (query.includes("IPO")) {
      return "The Indian primary market (IPO) is experiencing significant retail enthusiasm. When analyzing an IPO, verify the grey market premium (GMP) but focus primarily on fundamentals: check the Debt-to-Equity ratio, the offer's price-to-earnings (P/E) multiple compared to listed peers, and whether the issue is a Fresh Issue (capital goes to company growth) or an Offer for Sale (OFS - existing promoters exiting). Avoid companies with high OFS ratios and high valuations.";
    }

    if (query.includes("PORTFOLIO") || query.includes("OPTIMIZE") || query.includes("RISK") || query.includes("DIVERSIFY")) {
      return "Based on your current portfolio configuration, you have a high concentration in technology and crypto assets. To optimize your risk-adjusted returns (Sharpe Ratio), I recommend diversifying into defensive sectors (Healthcare or Consumer Staples) or short-duration treasuries. Your overall Portfolio Health Score is currently 78/100, indicating good performance with moderate-to-high downside risk.";
    }

    return "Hello! I am your MarketMind AI financial assistant. I can help you analyze Indian stock profiles (e.g. RELIANCE, TCS), cryptocurrency trends (e.g. BTC, ETH), news sentiment, or review your portfolio allocations. What asset would you like to review today?";
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
