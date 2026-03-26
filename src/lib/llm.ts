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
    ...(systemMessage
      ? [{ role: "system" as const, content: systemMessage }]
      : []),
    { role: "user" as const, content: prompt },
  ];

  const completion = await openai.chat.completions.create({
    model,
    messages,
    max_completion_tokens: maxTokens,
  });

  return completion.choices?.[0]?.message?.content ?? "";
}

const EXTRACTION_SYSTEM = `你是一个专业的信息抽取助手。用户会提供一段原文，你必须只输出一个合法 JSON 对象（不要 markdown 代码块、不要前后说明文字），且必须能被 JSON.parse 解析。

JSON 必须严格符合以下结构（字段名一致）：
{
  "summary": "string，对原文的简洁总结",
  "actionItems": [
    { "task": "string，明确可执行的任务", "owner": "string，可选，负责人", "dueDate": "string，可选，截止时间" }
  ],
  "risks": [
    { "title": "string", "reason": "string", "severity": "low" | "medium" | "high" }
  ],
  "openQuestions": ["string"]
}

规则：
- 不要编造原文中不存在的信息。
- 没有明确行动项时 actionItems 用 []；没有明显风险时 risks 用 []；没有待澄清点时 openQuestions 用 []。
- owner、dueDate 仅在原文有依据时填写，否则省略该字段。`;

/**
 * Week 2：使用 Kimi（Moonshot）Chat Completions 的 JSON 模式做结构化抽取。
 * 官方要求开启 json_object 时须在提示中明确 JSON 形状（见 EXTRACTION_SYSTEM）。
 */
export async function extractStructuredJson(
  userText: string,
  options?: { model?: string; maxTokens?: number },
): Promise<string> {
  if (!apiKey) {
    throw new Error("Missing MOONSHOT_API_KEY in environment.");
  }

  const model = options?.model ?? DEFAULT_MODEL;
  const maxTokens = options?.maxTokens ?? 4096;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM },
      {
        role: "user",
        content: `请从以下文本抽取信息，并只输出 JSON 对象：\n\n${userText}`,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: maxTokens,
  });

  return completion.choices?.[0]?.message?.content ?? "";
}
