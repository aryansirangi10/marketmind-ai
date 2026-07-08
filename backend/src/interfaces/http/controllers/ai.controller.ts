// ==============================================================================
// AI Controller (HTTP Requests Handler)
// ==============================================================================

import { Request, Response } from "express";
import { ProviderRegistry } from "../../../infrastructure/config/provider-registry";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1, "Message is required."),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional()
});

export class AIController {
  private readonly aiProvider = ProviderRegistry.getAIProvider();

  /**
   * POST /api/v1/ai/chat
   * Generates a context-aware financial analysis using live/mock LLM completion
   */
  public chat = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = chatSchema.parse(req.body);
      const prompt = parsed.message;

      // Build history and message payload
      const messages = (parsed.history || []).map(h => ({
        role: h.role as "user" | "assistant" | "system",
        content: h.content
      }));
      messages.push({ role: "user" as const, content: prompt });

      // Generate completion (ProviderRegistry auto-switches live vs mock offline)
      const completion = await this.aiProvider.generateChatResponse(messages);

      res.status(200).json({
        success: true,
        data: {
          message: completion,
          role: "assistant"
        }
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: err.errors[0].message });
      } else {
        res.status(500).json({ success: false, error: err.message });
      }
    }
  };
}
