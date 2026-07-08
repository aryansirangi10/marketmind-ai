// ==============================================================================
// Live Google Gemini AI Provider Implementation
// ==============================================================================

import { IAIProvider, ChatMessage, SentimentAnalysisResult } from "../../../domain/providers/ai-provider.interface";

export class GeminiAIProvider implements IAIProvider {
  private readonly apiKey: string;
  private readonly modelName = "gemini-1.5-flash";
  private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    const contents: any[] = [];
    let systemInstruction = "You are a helpful, professional investment research assistant and financial advisor. Provide detailed technical and fundamental analysis.";

    // Separate system messages and map roles to Gemini schema
    messages.forEach(msg => {
      if (msg.role === "system") {
        systemInstruction = msg.content;
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      }
    });

    const body = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    };

    const res = await fetch(
      `${this.baseUrl}/models/${this.modelName}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  }

  public async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    const prompt = `
Analyze the market sentiment of the following financial text. 
Return your response ONLY in raw JSON format (no markdown blocks like \`\`\`json) matching this schema:
{
  "score": float, // between -1.0 (extremely negative) and 1.0 (extremely positive)
  "label": "positive" | "negative" | "neutral",
  "explanation": "short string explaining the rating"
}

Text to analyze:
"${text}"
`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    const res = await fetch(
      `${this.baseUrl}/models/${this.modelName}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json() as any;
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean potential markdown wrap
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(rawText);
      return {
        score: Number(parsed.score ?? 0.0),
        label: parsed.label || "neutral",
        explanation: parsed.explanation || "No explanation provided."
      };
    } catch (err) {
      // Fallback in case LLM outputs malformed JSON
      return {
        score: 0.0,
        label: "neutral",
        explanation: "Unable to parse structured sentiment response."
      };
    }
  }

  public async summarizeText(text: string): Promise<string> {
    const prompt = `Summarize the following financial news or transcript. Keep it concise, highlighting key market indicators or takeaways:\n\n${text}`;
    
    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    const res = await fetch(
      `${this.baseUrl}/models/${this.modelName}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";
  }
}
