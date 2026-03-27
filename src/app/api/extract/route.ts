import { NextRequest, NextResponse } from "next/server";
import { extractStructuredJson } from "@/lib/llm";
import { ExtractionSchema } from "@/schemas/extraction";
import { checkUserInputSafety } from "@/lib/safety";
import { normalizeChatUsage } from "@/lib/chat-usage";
import { metricsFromNormalizedUsage } from "@/lib/route-metrics";

type RequestBody = {
  text?: string;
};

/** 解析模型返回：去掉可选的 ```json 围栏后 JSON.parse */
function parseModelJsonObject(raw: string): unknown {
  let s = raw.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i;
  const m = s.match(fence);
  if (m) {
    s = m[1].trim();
  }
  return JSON.parse(s);
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MOONSHOT_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "请配置 MOONSHOT_API_KEY（Week 2 与 Week 1 均使用 Kimi / Moonshot API）。" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as RequestBody;
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "请输入待抽取文本。" }, { status: 400 });
    }

    if (text.length > 20000) {
      return NextResponse.json(
        { error: "输入过长，请缩短后再试（建议不超过 20000 字符）。" },
        { status: 400 }
      );
    }

    const safety = await checkUserInputSafety(text);
    if (!safety.ok) {
      return NextResponse.json(
        { error: safety.message, blocked: true },
        { status: 400 },
      );
    }

    const llmStarted = Date.now();
    const { content: raw, usage, model: modelUsed } =
      await extractStructuredJson(text);
    const latencyMs = Date.now() - llmStarted;

    if (!raw.trim()) {
      return NextResponse.json(
        { error: "模型未返回内容，请稍后重试。" },
        { status: 500 }
      );
    }

    let parsed: unknown;
    try {
      parsed = parseModelJsonObject(raw);
    } catch (e) {
      console.error("Extract JSON parse error:", e, raw.slice(0, 500));
      return NextResponse.json(
        { error: "模型返回不是合法 JSON，请稍后重试。" },
        { status: 500 }
      );
    }

    const validated = ExtractionSchema.safeParse(parsed);
    if (!validated.success) {
      console.error("Extract schema mismatch:", validated.error.flatten());
      return NextResponse.json(
        { error: "结构化结果与约定 schema 不一致，请稍后重试。" },
        { status: 500 }
      );
    }

    const normalized = normalizeChatUsage(usage);
    const metrics = metricsFromNormalizedUsage({
      usage: normalized,
      latencyMs,
      model: modelUsed,
      usedFileSearch: false,
      usedFunctionTool: false,
      fileSearchCalls: 0,
    });

    return NextResponse.json({
      result: validated.data,
      model: modelUsed,
      metrics,
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "结构化抽取失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
