// ==============================================================================
// Domain Interfaces for AI Providers
// ==============================================================================

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SentimentAnalysisResult {
  score: number; // Scale -1.0 (extremely negative) to +1.0 (extremely positive)
  label: "positive" | "negative" | "neutral";
  explanation: string;
}

export interface IAIProvider {
  /**
   * Generates conversational response using LLM
   */
  generateChatResponse(messages: ChatMessage[]): Promise<string>;

  /**
   * Evaluates text for market sentiment (e.g. news headlines or transcripts)
   */
  analyzeSentiment(text: string): Promise<SentimentAnalysisResult>;

  /**
   * Condenses a long financial document or news story into a concise summary
   */
  summarizeText(text: string): Promise<string>;
}
