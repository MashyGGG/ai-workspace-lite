import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MODEL, generateText } from "@/lib/llm";
import { buildPrompt } from "@/prompts";
import type { PromptTask } from "@/types/prompt-task";

type RequestBody = {
  text?: string;
  task?: PromptTask;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const text = body.text?.trim() ?? "";
    const task = body.task;

    if (!text) {
      return NextResponse.json({ error: "请输入文本内容。" }, { status: 400 });
    }

    if (!task) {
      return NextResponse.json({ error: "请选择任务类型。" }, { status: 400 });
    }

    // 超长输入会导致 token/长度校验失败，这里做个轻量保护提升体验。
    if (text.length > 20000) {
      return NextResponse.json(
        { error: "输入过长，请缩短后再试（建议不超过 20000 字符）。" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(task, text);

    const result = await generateText({
      model: DEFAULT_MODEL,
      prompt,
      // system 里给出最小约束，减少模型跑偏/臆测。
      systemMessage:
        "你必须严格遵循用户的要求输出，不要编造原文中不存在的信息。所有输出请使用中文。",
    });

    return NextResponse.json({
      result,
      model: DEFAULT_MODEL,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "生成失败，请稍后重试。" },
      { status: 500 }
    );
  }
}

