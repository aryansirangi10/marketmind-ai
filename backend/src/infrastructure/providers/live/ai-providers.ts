// ==============================================================================
// OpenAI, Anthropic, and Local LLM AI Provider Wrappers (Lightweight HTTP clients)
// ==============================================================================

import { IAIProvider, ChatMessage, SentimentAnalysisResult } from "../../../domain/providers/ai-provider.interface";

export class OpenAIAIProvider implements IAIProvider {
  private readonly apiKey: string;
  private readonly modelName = "gpt-4o-mini";
  private readonly baseUrl = "https://api.openai.com/v1/chat/completions";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`);
    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || "No response generated.";
  }

  public async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    const prompt = `Analyze sentiment: "${text}". Return JSON { "score": float (-1.0 to 1.0), "label": "positive"|"negative"|"neutral", "explanation": "string" }`;
    const responseText = await this.generateChatResponse([{ role: "user", content: prompt }]);
    try {
      const clean = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return {
        score: Number(parsed.score ?? 0.0),
        label: parsed.label || "neutral",
        explanation: parsed.explanation || "No explanation."
      };
    } catch {
      return { score: 0.0, label: "neutral", explanation: "Failed to parse sentiment." };
    }
  }

  public async summarizeText(text: string): Promise<string> {
    return this.generateChatResponse([{ role: "user", content: `Summarize this text: \n\n${text}` }]);
  }
}

export class AnthropicAIProvider implements IAIProvider {
  private readonly apiKey: string;
  private readonly modelName = "claude-3-5-haiku-20241022";
  private readonly baseUrl = "https://api.anthropic.com/v1/messages";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    const system = messages.find(m => m.role === "system")?.content || "You are a finance assistant.";
    const userMessages = messages.filter(m => m.role !== "system");

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.modelName,
        system,
        messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 1024
      })
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.statusText}`);
    const data = await res.json() as any;
    return data.content?.[0]?.text || "No response generated.";
  }

  public async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    const prompt = `Analyze sentiment: "${text}". Return JSON { "score": float (-1.0 to 1.0), "label": "positive"|"negative"|"neutral", "explanation": "string" }`;
    const responseText = await this.generateChatResponse([{ role: "user", content: prompt }]);
    try {
      const clean = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return {
        score: Number(parsed.score ?? 0.0),
        label: parsed.label || "neutral",
        explanation: parsed.explanation || "No explanation."
      };
    } catch {
      return { score: 0.0, label: "neutral", explanation: "Failed to parse sentiment." };
    }
  }

  public async summarizeText(text: string): Promise<string> {
    return this.generateChatResponse([{ role: "user", content: `Summarize this text: \n\n${text}` }]);
  }
}

export class LocalAIProvider implements IAIProvider {
  private readonly baseUrl: string;

  constructor(endpoint = "http://localhost:11434/v1/chat/completions") {
    this.baseUrl = endpoint;
  }

  public async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      if (!res.ok) throw new Error(`Local LLM error: ${res.statusText}`);
      const data = await res.json() as any;
      return data.choices?.[0]?.message?.content || "No response generated.";
    } catch (err: any) {
      throw new Error(`Failed to contact local LLM: ${err.message}`);
    }
  }

  public async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    const prompt = `Analyze sentiment: "${text}". Return JSON { "score": float (-1.0 to 1.0), "label": "positive"|"negative"|"neutral", "explanation": "string" }`;
    const responseText = await this.generateChatResponse([{ role: "user", content: prompt }]);
    try {
      const clean = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return {
        score: Number(parsed.score ?? 0.0),
        label: parsed.label || "neutral",
        explanation: parsed.explanation || "No explanation."
      };
    } catch {
      return { score: 0.0, label: "neutral", explanation: "Failed to parse sentiment." };
    }
  }

  public async summarizeText(text: string): Promise<string> {
    return this.generateChatResponse([{ role: "user", content: `Summarize this text: \n\n${text}` }]);
  }
}
