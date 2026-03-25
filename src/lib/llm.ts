import OpenAI from "openai";

const baseURL = process.env.MOONSHOT_BASE_URL || "https://api.moonshot.ai/v1";
const apiKey = process.env.MOONSHOT_API_KEY;

export const DEFAULT_MODEL = process.env.MOONSHOT_MODEL || "kimi-k2.5";

// Kimi (Moonshot AI) exposes an OpenAI-SDK-compatible HTTP API.
export const openai = new OpenAI({
  apiKey: apiKey || "",
  baseURL,
});

export type GenerateTextOptions = {
  prompt: string;
  model?: string;
  systemMessage?: string;
  maxTokens?: number;
};

export async function generateText({
  prompt,
  model = DEFAULT_MODEL,
  systemMessage,
  maxTokens = 1024,
}: GenerateTextOptions): Promise<string> {
  if (!apiKey) {
    throw new Error("Missing MOONSHOT_API_KEY in environment.");
  }

  const messages = [
    ...(systemMessage ? [{ role: "system" as const, content: systemMessage }] : []),
    { role: "user" as const, content: prompt },
  ];

  const completion = await openai.chat.completions.create({
    model,
    messages,
    max_completion_tokens: maxTokens,
  });

  return completion.choices?.[0]?.message?.content ?? "";
}

