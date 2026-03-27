继续，我们把 **Week 2** 直接落到能照做的程度。

这周的目标只有一个：

# **把 Week 1 的自由文本输出，升级成“结构化输出”**

> **本仓库实现（国内 Kimi）**：结构化抽取走 **Moonshot Chat Completions** + `response_format: json_object` + Zod，**不使用** OpenAI Responses / `OPENAI_API_KEY`。说明见 [domestic-llm.md](../domestic-llm.md)。

这样做很关键，因为 OpenAI 的 Structured Outputs 目标就是让模型按你定义的 JSON Schema 输出，减少格式漂移；官方文档还明确提到它的好处包括更可靠的类型安全、可检测的拒答，以及更少依赖“强行提示词”来约束格式。JavaScript SDK 也支持用 **Zod** 来定义 schema；在 Responses API 里可以用 `responses.parse(...)`，并从 `response.output_parsed` 取到解析后的对象。([OpenAI 平台](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript))

---

# Week 2 你要做出的 Demo

## 名称

**Structured Extractor v1**

## 功能

输入一段会议纪要、需求描述或项目说明，输出一个固定结构：

- `summary`: 简要总结

- `actionItems`: 行动项列表

- `risks`: 风险列表

- `openQuestions`: 待确认问题

## 本周结束的过关标准

你要达到这 4 点：

1. 能稳定输出合法对象，而不是“看起来像 JSON 的文本”

2. 前端能把对象渲染成卡片，不只是打印字符串

3. 你能解释“为什么 schema 比 prompt 更像业务边界”

4. 你有一个 1–2 分钟可演示 Demo

---

# Week 2 为什么这么安排

Week 1 你练的是“把任务说清楚”。
Week 2 你练的是“把输出收紧成业务对象”。

这一步会直接影响你后面的：

- 文档抽取

- 工单分类

- 方案生成

- 工具调用参数

- eval 数据集设计

Vercel AI SDK 也把 `generateObject` / `streamObject` 单独作为结构化数据生成入口，说明这已经是 AI 应用开发里的主流能力，而不只是小技巧。([Vercel](https://vercel.com/docs/ai-sdk))

---

# Week 2 每周每日任务版

## 周一（1–1.5 小时）

今天只做两件事：

### 1. 安装依赖

在 Week 1 项目里执行：

```Shell
npm install zod
```


### 2. 看最少量资料

今天只看 2 个点：

- Structured Outputs 解决什么问题

- JS SDK 为什么推荐配合 Zod

你要记住一句话：
**这周不是让模型“写得像 JSON”，而是让模型“交付一个可用对象”。**
官方 Structured Outputs 文档明确把“schema adherence”和“JS SDK + Zod”作为核心用法。([OpenAI 平台](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript))

### 今日产出

新建：

- `notes/week2-day1.md`

写 5 句话回答：

- 什么是结构化输出

- 为什么它比自由文本更适合业务系统

- 为什么我要从 Week 2 就开始用 schema

---

## 周二（1–1.5 小时）

今天设计 schema，不写太多 UI。

我建议你用这版 schema，足够实用，也不会太复杂：

```TypeScript
summary: string
actionItems: Array<{
  task: string
  owner?: string
  dueDate?: string
}>
risks: Array<{
  title: string
  reason: string
  severity: "low" | "medium" | "high"
}>
openQuestions: string[]
```


### 为什么这样设计

- `summary`：保留整体理解

- `actionItems`：后面可直接接 task/tool

- `risks`：后面可直接做评审和风险提示

- `openQuestions`：后面可直接做澄清问题生成

### 今日产出

新建：

- `src/schemas/extraction.ts`

---

## 周三（1–1.5 小时）

今天打通后端。

你要做：

- 新建 `/api/extract`

- 使用 `openai.responses.parse`

- 用 Zod schema 做结构化输出

- 返回 `output_parsed`

官方文档给出的 Responses 结构化输出示例就是 `openai.responses.parse({ ... text: { format: zodTextFormat(...) } })`，然后通过 `response.output_parsed` 取结果。([OpenAI 平台](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript))

---

## 周四（1–1.5 小时）

今天做前端页面。

你要完成：

- 输入框

- 一个“开始抽取”按钮

- 结果展示区

- 错误提示

- loading 状态

这一天先不纠结美观，先确保“能看懂对象”。

---

## 周五（1 小时）

今天做“对象渲染”。

你要把结果拆成 4 个区块：

- 简要总结

- 行动项

- 风险

- 待确认问题

今天的重点是：
**不要直接显示 `JSON.stringify` 作为最终展示。**

因为结构化输出的意义，不只是给程序看，也要给人看。

---

## 周六（4–6 小时）

今天做本周核心集成。

你要完成：

- `Structured Extractor v1` 页面

- schema 文件

- API 路由

- 结果卡片组件

- 至少 3 条测试输入

- 一个“复制 JSON”按钮

建议你今天顺手加一个小功能：

- 结果“导出 markdown”
或者

- 一键“复制摘要”

---

## 周日（3–4 小时）

今天做作品化。

你要完成：

- README 第一版

- 录一个 1–2 分钟 Demo

- 写 1 个失败案例

失败案例建议写：

- 哪种输入让 actionItems 抽取不稳定

- 哪种风险等级判断偏主观

- 下周你准备怎么改

---

# Week 2 项目目录增量

在 Week 1 基础上新增这些文件：

```Plain Text
src/
├─ app/
│  ├─ api/
│  │  └─ extract/
│  │     └─ route.ts
│  └─ extract/
│     └─ page.tsx
├─ components/
│  ├─ ExtractionResult.tsx
│  └─ JsonPreview.tsx
├─ schemas/
│  └─ extraction.ts
└─ types/
   └─ extraction.ts
```


---

# Week 2 代码骨架

## 1）`src/schemas/extraction.ts`

```TypeScript
import { z } from "zod";

export const ActionItemSchema = z.object({
  task: z.string().describe("明确可执行的任务"),
  owner: z.string().optional().describe("负责人，如果原文未提及可省略"),
  dueDate: z.string().optional().describe("截止时间，如果原文未提及可省略"),
});

export const RiskSchema = z.object({
  title: z.string().describe("风险标题"),
  reason: z.string().describe("为什么这是一个风险"),
  severity: z.enum(["low", "medium", "high"]).describe("风险等级"),
});

export const ExtractionSchema = z.object({
  summary: z.string().describe("对原文的简洁总结"),
  actionItems: z.array(ActionItemSchema).describe("从原文中提取的行动项"),
  risks: z.array(RiskSchema).describe("从原文中识别的风险"),
  openQuestions: z.array(z.string()).describe("仍需澄清的问题"),
});

export type ExtractionResult = z.infer<typeof ExtractionSchema>;
```


---

## 2）`src/app/api/extract/route.ts`

```TypeScript
import { NextRequest, NextResponse } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { openai, DEFAULT_MODEL } from "@/lib/openai";
import { ExtractionSchema } from "@/schemas/extraction";

type RequestBody = {
  text?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "请输入待抽取文本。" }, { status: 400 });
    }

    const response = await openai.responses.parse({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content:
            "你是一个专业的信息抽取助手。请从输入文本中抽取结构化信息。不要编造原文中不存在的信息；如果原文没有明确内容，请返回空数组或保守表达。",
        },
        {
          role: "user",
          content: text,
        },
      ],
      text: {
        format: zodTextFormat(ExtractionSchema, "extraction_result"),
      },
    });

    return NextResponse.json({
      result: response.output_parsed,
      model: DEFAULT_MODEL,
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "结构化抽取失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
```


这段代码的核心思路和官方文档一致：
用 `zodTextFormat(...)` 提供 schema，用 `responses.parse(...)` 拿解析后的对象。([OpenAI 平台](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript))

---

## 3）`src/components/ExtractionResult.tsx`

```Plain Text
import type { ExtractionResult } from "@/schemas/extraction";

type Props = {
  data: ExtractionResult;
  model?: string;
};

export function ExtractionResult({ data, model }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-4">
        <div className="mb-2 text-sm text-gray-500">
          {model ? `模型：${model}` : "抽取结果"}
        </div>
        <h2 className="mb-2 text-lg font-semibold">简要总结</h2>
        <p className="text-sm leading-6">{data.summary}</p>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">行动项</h2>
        {data.actionItems.length ? (
          <ul className="space-y-3">
            {data.actionItems.map((item, idx) => (
              <li key={idx} className="rounded-lg bg-gray-50 p-3 text-sm">
                <div><strong>任务：</strong>{item.task}</div>
                <div><strong>负责人：</strong>{item.owner || "未明确"}</div>
                <div><strong>截止时间：</strong>{item.dueDate || "未明确"}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">未发现明确行动项</p>
        )}
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">风险</h2>
        {data.risks.length ? (
          <ul className="space-y-3">
            {data.risks.map((risk, idx) => (
              <li key={idx} className="rounded-lg bg-gray-50 p-3 text-sm">
                <div><strong>风险点：</strong>{risk.title}</div>
                <div><strong>原因：</strong>{risk.reason}</div>
                <div><strong>等级：</strong>{risk.severity}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">未发现明显风险</p>
        )}
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">待确认问题</h2>
        {data.openQuestions.length ? (
          <ul className="list-disc pl-5 text-sm leading-7">
            {data.openQuestions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">暂无待确认问题</p>
        )}
      </div>
    </div>
  );
}
```


---

## 4）`src/components/JsonPreview.tsx`

```Plain Text
type Props = {
  value: unknown;
};

export function JsonPreview({ value }: Props) {
  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">JSON 预览</h2>
      <pre className="overflow-auto whitespace-pre-wrap text-sm leading-6">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
```


---

## 5）`src/app/extract/page.tsx`

```Plain Text
"use client";

import { useState } from "react";
import type { ExtractionResult } from "@/schemas/extraction";
import { ExtractionResult as ExtractionResultView } from "@/components/ExtractionResult";
import { JsonPreview } from "@/components/JsonPreview";

export default function ExtractPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExtract() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "请求失败");
      }

      setResult(data.result);
      setModel(data.model || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生未知错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Structured Extractor v1</h1>
        <p className="text-sm text-gray-600">
          输入一段文本，输出结构化摘要、行动项、风险和待确认问题。
        </p>
      </header>

      <section className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="请输入会议纪要、需求描述、项目背景说明..."
          className="w-full rounded-lg border px-3 py-2"
        />

        <div className="flex gap-3">
          <button
            onClick={handleExtract}
            disabled={loading || !text.trim()}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "抽取中..." : "开始抽取"}
          </button>

          <button
            onClick={() => {
              setText("");
              setResult(null);
              setError("");
            }}
            className="rounded-lg border px-4 py-2"
          >
            清空
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ExtractionResultView data={result} model={model} />
          <JsonPreview value={result} />
        </div>
      ) : null}
    </main>
  );
}
```


---

# Week 2 测试输入样例

## 样例 1：会议纪要

```Plain Text
本周项目例会决定，下周一前由小王完成首页原型，小李负责整理竞品资料。当前存在一个明显风险：需求方还没有确认会员等级规则，如果继续延后，开发排期和测试范围都可能变化。另外，关于是否需要管理员后台导出功能，团队还没有统一结论。
```


## 样例 2：需求描述

```Plain Text
我们计划开发一个团队知识助手，支持上传文档、按文档问答、输出摘要和待办。当前还没有明确是否需要多工作区权限隔离，也没有确定知识库更新频率。后续可能需要增加操作日志功能。
```


## 样例 3：模糊输入

```Plain Text
这周先整体推进一下，优先把重要的事情往前做，具体谁做之后再定。
```


你要观察的重点：

- 模糊输入时，actionItems 是否会变少

- 风险等级是否有过度主观

- openQuestions 是否能补出真正“待澄清”的点，而不是重复 summary

---

# Week 2 README 模板

把下面追加到你的 `README.md`：

```Plain Text
## Week 2 - Structured Extractor v1

### 本周目标
把自由文本生成升级为结构化输出，让模型直接返回可用业务对象。

### 核心能力
- 使用 Zod 定义 schema
- 使用 Responses API 的结构化输出
- 抽取 summary / actionItems / risks / openQuestions
- 前端按对象渲染，不只是显示字符串

### 为什么重要
结构化输出比自由文本更适合业务系统，因为：
1. 更容易做前端渲染
2. 更容易接后续工具调用
3. 更容易做评测和回归
4. 更容易在后端持久化

### 本周复盘
#### 做对了什么
- 

#### 结构化输出哪里还不稳
- 

#### 下周准备改什么
- 
```


---

# Week 2 资料清单

## 必看

5. OpenAI Structured Outputs 指南：重点看“schema adherence、explicit refusals、Zod support、responses.parse”。([OpenAI 平台](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript))

6. OpenAI Responses API 参考：知道 Responses 是统一入口，支持文本、工具等能力。([OpenAI 平台](https://platform.openai.com/docs/api-reference/responses/compacted-object?api-mode=responses&utm_source=chatgpt.com))

## 可选

7. OpenAI Function Calling 指南：这周不用实装，但你可以提前知道“schema”后面会自然过渡到工具参数。([OpenAI 平台](https://platform.openai.com/docs/guides/function-calling?api-mode=respon&utm_source=chatgpt.com))

8. Vercel AI SDK 的 `generateObject` / `streamObject`：先知道 TS 生态也把结构化输出当成一等能力。([Vercel](https://vercel.com/docs/ai-sdk))

---

# Week 2 Demo 脚本

周日录视频时，直接按这个顺序讲：

9. 这是 Week 2 的 Structured Extractor。

10. 我输入一段会议纪要。

11. 点击“开始抽取”。

12. 左边展示结构化卡片：总结、行动项、风险、待确认问题。

13. 右边展示 JSON 预览。

14. 最后说明：这周的重点不是让模型“写得更像人”，而是让它“输出更像业务对象”。

1–2 分钟就够。

---

# 这周最该盯住的 3 个点

## 1）不要让 schema 太花

Week 2 的 schema 要“够用”，不要一上来塞十几个字段。
字段越多，越容易把问题从“信息抽取”变成“你自己还没想清业务对象”。

## 2）先接受空数组

没有明确行动项，就返回空数组。
没有明确风险，就返回空数组。
这比模型硬凑内容更好。Structured Outputs 的价值之一就是你可以把“没有”也表达得很清楚。([OpenAI 平台](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript))

## 3）把结果同时给“人”和“程序”看

所以我建议你保留两种视图：

- 卡片视图

- JSON 视图

这会让你在 Week 5 做 eval 时轻松很多。

---

# 做完 Week 2 后，你应该具备什么

到这周结束，你会从“我会让模型返回一段话”进阶到：

**我会让模型返回一个可验证、可渲染、可继续处理的对象。**

这一步很关键，因为后面：

- Week 3 的文档问答会需要更稳定的答案结构

- Week 4 的工具调用会需要 schema 意识

- Week 5 的 eval 会需要固定输出格式

下一条我继续给你 **Week 3 的可直接照做版**：
包括 File Search / 带引用问答的每日任务、资料清单、目录结构、代码骨架和 Demo 脚本。

