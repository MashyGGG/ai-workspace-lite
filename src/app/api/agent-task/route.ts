import { NextRequest, NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { moonshot, DEFAULT_MODEL } from "@/lib/llm";
import { checkUserInputSafety } from "@/lib/safety";
import type { ChatCompletionUsageLike } from "@/lib/chat-usage";
import {
  addNormalizedUsage,
  normalizeChatUsage,
} from "@/lib/chat-usage";
import { metricsFromNormalizedUsage } from "@/lib/route-metrics";
import { createTask } from "@/tools/create-task";
import { createTaskTool } from "@/tools";
import type { Task } from "@/types/task";

type Source = "extract" | "docs";

function parseSource(v: unknown, fallback: Source): Source {
  return v === "extract" || v === "docs" ? v : fallback;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MOONSHOT_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "请配置 MOONSHOT_API_KEY。" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as {
      text?: string;
      source?: string;
    };
    const text = body.text?.trim() ?? "";
    const source = parseSource(body.source, "docs");

    if (!text) {
      return NextResponse.json({ error: "请输入内容" }, { status: 400 });
    }

    if (text.length > 20000) {
      return NextResponse.json(
        { error: "输入过长，请缩短后再试（建议不超过 20000 字符）。" },
        { status: 400 },
      );
    }

    const safety = await checkUserInputSafety(text);
    if (!safety.ok) {
      return NextResponse.json(
        { error: safety.message, blocked: true },
        { status: 400 },
      );
    }

    const systemContent =
      "你是一个工作台助手。如果用户请求创建待办或跟进事项，请优先调用 create_task。任务标题要简洁明确。任务是否写入列表由用户在界面中确认；你不得声称已自动保存或绕过确认。";

    const userContent = `来源页面：${source}\n内容：${text}`;

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ];

    const llmStarted = Date.now();
    const first = await moonshot.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      tools: [createTaskTool],
      tool_choice: "auto",
    });

    const modelUsed = first.model ?? DEFAULT_MODEL;
    const firstUsage = normalizeChatUsage(
      first.usage as ChatCompletionUsageLike | undefined,
    );

    const msg = first.choices[0]?.message;
    const toolCalls = msg?.tool_calls;

    if (!toolCalls?.length) {
      const latencyMs = Date.now() - llmStarted;
      const metrics = metricsFromNormalizedUsage({
        usage: firstUsage,
        latencyMs,
        model: modelUsed,
        usedFileSearch: false,
        usedFunctionTool: false,
        fileSearchCalls: 0,
      });
      return NextResponse.json({
        message: msg?.content?.trim() || "未触发任务创建。",
        proposedTask: null,
        approvalRequired: false,
        createdTask: null,
        model: modelUsed,
        metrics,
      });
    }

    const assistantTurn: ChatCompletionMessageParam = {
      role: "assistant",
      content: msg.content,
      tool_calls: toolCalls,
    };

    let firstCreated: Task | null = null;
    const toolMessages: ChatCompletionMessageParam[] = [];

    for (const tc of toolCalls) {
      if (tc.type !== "function") continue;
      if (tc.function.name !== "create_task") {
        toolMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify({ error: "仅支持 create_task 工具。" }),
        });
        continue;
      }

      let args: { title?: string; source?: string } = {};
      try {
        args = JSON.parse(tc.function.arguments || "{}") as {
          title?: string;
          source?: string;
        };
      } catch {
        toolMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify({ error: "工具参数不是合法 JSON。" }),
        });
        continue;
      }

      const title = (args.title ?? "").trim();
      if (!title) {
        toolMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify({ error: "任务标题不能为空。" }),
        });
        continue;
      }

      const createdTask = createTask({
        title,
        source: parseSource(args.source, source),
      });
      if (!firstCreated) firstCreated = createdTask;
      toolMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify({
          pendingUserApproval: true,
          task: createdTask,
        }),
      });
    }

    const secondMessages: ChatCompletionMessageParam[] = [
      ...messages,
      assistantTurn,
      ...toolMessages,
    ];

    const second = await moonshot.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: secondMessages,
    });

    const finalMsg = second.choices[0]?.message?.content?.trim();
    const mergedUsage = addNormalizedUsage(
      firstUsage,
      normalizeChatUsage(
        second.usage as ChatCompletionUsageLike | undefined,
      ),
    );
    const latencyMs = Date.now() - llmStarted;
    const metrics = metricsFromNormalizedUsage({
      usage: mergedUsage,
      latencyMs,
      model: modelUsed,
      usedFileSearch: false,
      usedFunctionTool: true,
      fileSearchCalls: 0,
    });

    return NextResponse.json({
      message:
        finalMsg ||
        "已生成任务提议，请在界面中点击「确认创建」后才会保存到本地列表。",
      proposedTask: firstCreated,
      approvalRequired: !!firstCreated,
      createdTask: null,
      model: modelUsed,
      metrics,
    });
  } catch (error) {
    console.error("agent-task error:", error);
    return NextResponse.json({ error: "任务处理失败" }, { status: 500 });
  }
}
