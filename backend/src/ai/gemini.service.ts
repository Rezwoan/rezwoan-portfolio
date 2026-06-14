import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI | null;
  private readonly model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
    if (!this.ai) this.logger.warn('GEMINI_API_KEY not set — AI features will degrade gracefully.');
  }

  get available(): boolean {
    return this.ai !== null;
  }

  /** One-shot JSON generation. Returns parsed object or null on any failure. */
  async json<T = any>(system: string, user: string): Promise<T | null> {
    if (!this.ai) return null;
    try {
      const res = await this.ai.models.generateContent({
        model: this.model,
        contents: user,
        config: {
          systemInstruction: system,
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });
      const text = res.text ?? '';
      return JSON.parse(stripFences(text)) as T;
    } catch (err) {
      this.logger.error(`Gemini json failed: ${(err as Error).message}`);
      return null;
    }
  }

  /** Streaming chat. Yields text chunks. Falls back to a single message if unavailable. */
  async *stream(system: string, turns: ChatTurn[]): AsyncGenerator<string> {
    if (!this.ai) {
      yield "The AI assistant is offline right now — please use the contact form and Rezwoan will reply personally.";
      return;
    }
    try {
      const contents = turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] }));
      const stream = await this.ai.models.generateContentStream({
        model: this.model,
        contents,
        config: { systemInstruction: system, temperature: 0.7, maxOutputTokens: 800 },
      });
      for await (const chunk of stream) {
        const t = chunk.text;
        if (t) yield t;
      }
    } catch (err) {
      this.logger.error(`Gemini stream failed: ${(err as Error).message}`);
      yield ' …sorry, I hit an error. Please try again or use the contact form.';
    }
  }
}

function stripFences(s: string): string {
  return s.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
}
