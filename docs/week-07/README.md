下面是 **Week 7 的执行版**。
这周的主题是：

# Ops Lite v1

给你的 **AI Workspace Lite Alpha** 补上最基础的 **成本、延迟、请求日志和模型路由意识**。

这周为什么重要：Responses API 的返回对象本身就带 `usage`，包括 `input_tokens`、`output_tokens` 和 `total_tokens`，而且还支持用 `max_output_tokens` 限制输出规模、用 `max_tool_calls` 限制内建工具调用次数；这意味着你已经有条件把“这次请求花了多少、慢在哪、是否该换模型”变成工程可见信息，而不是凭感觉优化。([platform.openai.com](https://platform.openai.com/docs/api-reference/responses/retrieve?utm_source=chatgpt.com))

另外，你现在项目已经用到了 `file_search`，而它除了 token 费用外，还有单独的工具调用费和存储费；官方 pricing 目前列的是 **file search storage $0.10/GB/天（前 1GB 免费）**，**file search tool call $2.50/1k calls**。如果你不把这些记下来，后面很容易“功能越做越多，但不知道贵在哪”。([platform.openai.com](https://platform.openai.com/docs/pricing/?utm_source=chatgpt.com))

---

## 本周唯一目标

做出 **Ops Lite v1**，至少包括 4 个能力：

1. 每次请求记录：

  - 模型名

  - 输入/输出 token

  - 总 token

  - 耗时

  - 是否用了 `file_search`

  - 是否触发了 function tool

2. 能估算单次请求成本

3. 有一个 `/ops` 页面能看最近请求

4. 至少做一次“小模型 vs 默认模型”的对比实验

这周先不做完整 tracing 平台。OpenAI 现在确实有 Agents SDK 的 trace 能力，也有 trace grading，但它更适合你在工作流更复杂时上；当前阶段，先把日志、成本和延迟做清楚更合适。([platform.openai.com](https://platform.openai.com/docs/guides/agents-sdk/?utm_source=chatgpt.com) ([OpenAI平台](https://platform.openai.com/docs/guides/trace-grading?utm_source=chatgpt.com)))

---

## 本周结束的验收标准

到周日，你至少要满足这 6 条：

5. `/api/extract`、`/api/ask-docs`、`/api/agent-task` 都会返回 usage 和 latency

6. 你有一个本地 `ops` store，能保存最近请求

7. `/ops` 页面能展示最近 20 条请求

8. 你能看出哪类请求最慢

9. 你能估算哪类请求最贵

10. 你能写出一个简单结论：
“哪个场景继续用 `gpt-5-mini`，哪个场景值得试更强模型”

当前官方模型页显示，`gpt-5-mini` 是 GPT-5 的更快、更省成本版本，适合定义清晰的任务；其文本价格目前是 **输入 $0.25/1M tokens、输出 $2.00/1M tokens**。而 `gpt-5` 页面则明确写着它是“previous”模型，并推荐使用更新的 GPT-5.1；所以你这周没必要盲目升级模型，先把观测能力做出来更重要。([platform.openai.com](https://platform.openai.com/docs/models/gpt-5-mini?utm_source=chatgpt.com) ([OpenAI平台](https://platform.openai.com/docs/models/gpt-5-mini?utm_source=chatgpt.com)))

---

# 本周策略先定死

## 第一条：先记录，再优化

OpenAI 的 cost optimization 和 latency optimization 指南都强调，降成本和降延迟最常见的手段其实是：减少请求数、减少输入输出 token、选更小模型、并行化，以及别什么都默认交给 LLM。也就是说，优化之前先知道“请求都长什么样”最关键。([platform.openai.com](https://platform.openai.com/docs/guides/cost-optimization?utm_source=chatgpt.com) ([OpenAI平台](https://platform.openai.com/docs/guides/cost-optimization?utm_source=chatgpt.com)))

## 第二条：这周先做应用内观测，不上重平台

你完全可以先把 usage、latency 和 cost estimate 作为接口响应的一部分返回，再由前端保存到 `localStorage`。这周目标不是搭 observability 基础设施，而是让你第一次拥有“最近 20 次请求到底发生了什么”的可见性。

## 第三条：Prompt caching 先按“有意识利用”处理

官方说明，Prompt Caching 对 **gpt-4o 及更新模型** 自动开启；对于 **1024 tokens 以上** 的请求，如果前缀完全一致，就可能获得缓存收益。官方还提到它能显著降低延迟和输入成本，并建议把静态内容放在前面、动态内容放在后面。你这周不用专门开发缓存系统，但要开始按这个原则整理 prompt。([platform.openai.com](https://platform.openai.com/docs/guides/prompt-caching?utm_source=chatgpt.com))

---

# 每日执行版

## 周一，下班后 1–1.5 小时

目标：定义你要记录什么。

今天做 3 件事：

### 1. 新建 `ops` 目录与类型

新增：

```Plain Text
src/types/op-log.ts
src/lib/ops-store.ts
src/app/ops/page.tsx
```


### 2. 定义日志对象

建议就用这版：

```TypeScript
export type OpLog = {
  id: string;
  route: "extract" | "docs" | "task";
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  latencyMs: number;
  usedFileSearch: boolean;
  usedFunctionTool: boolean;
  estimatedCostUsd: number;
  createdAt: string;
  notes?: string;
};
```


### 3. 写一页说明

新建：

```Plain Text
docs/ops-week7.md
```


内容只写：

- 我为什么要记 usage / latency / tool usage

- 这周不做什么

- 我希望从日志里回答哪些问题

### 今天的完成标准

你已经明确“看什么”，而不是先乱写 dashboard。

---

## 周二，下班后 1–1.5 小时

目标：写成本估算工具。

今天你不碰页面，只写一个 helper。

当前官方 pricing 里，`gpt-5-mini` 的文本价格是：

- 输入：$0.25 / 1M tokens

- 缓存输入：$0.025 / 1M tokens

- 输出：$2.00 / 1M tokens
而 `file_search` 还会额外产生工具调用费用。([platform.openai.com](https://platform.openai.com/docs/pricing/?utm_source=chatgpt.com) ([OpenAI平台](https://platform.openai.com/docs/pricing/?utm_source=chatgpt.com)))

### 新建

```Plain Text
src/lib/cost.ts
```


### 代码骨架

```TypeScript
type CostInput = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  fileSearchCalls?: number;
};

const MODEL_PRICING = {
  "gpt-5-mini": {
    inputPer1M: 0.25,
    cachedInputPer1M: 0.025,
    outputPer1M: 2.0,
  },
};

export function estimateCostUsd({
  model,
  inputTokens,
  outputTokens,
  cachedTokens = 0,
  fileSearchCalls = 0,
}: CostInput) {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
  if (!pricing) return 0;

  const nonCachedInput = Math.max(inputTokens - cachedTokens, 0);

  const inputCost =
    (nonCachedInput / 1_000_000) * pricing.inputPer1M +
    (cachedTokens / 1_000_000) * pricing.cachedInputPer1M;

  const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;

  const fileSearchCost = (fileSearchCalls / 1000) * 2.5;

  return Number((inputCost + outputCost + fileSearchCost).toFixed(6));
}
```


### 今天的完成标准

你能对一组 usage 手工算出一个成本数字。

---

## 周三，下班后 1.5–2 小时

目标：让三个 API 路由都返回 usage + latency。

Responses API 返回对象里本身就有 `usage`；你只要把接口开始时间记下来，再在返回时附带 usage 和 latency 即可。([platform.openai.com](https://platform.openai.com/docs/api-reference/responses/retrieve?utm_source=chatgpt.com))

### 今天要改的文件

```Plain Text
src/app/api/extract/route.ts
src/app/api/ask-docs/route.ts
src/app/api/agent-task/route.ts
```


### 通用改法

在每个 route 里加：

```TypeScript
const startedAt = Date.now();

// ... call OpenAI API

const latencyMs = Date.now() - startedAt;

const usage = response.usage || {};
const inputTokens = usage.input_tokens || 0;
const outputTokens = usage.output_tokens || 0;
const totalTokens = usage.total_tokens || 0;
```


如果是 `ask-docs`，你还要标记：

```TypeScript
const usedFileSearch = true;
const fileSearchCalls = (response.output || []).filter(
  (item: any) => item.type === "file_search_call"
).length;
```


如果是 `agent-task`，你要标记：

```TypeScript
const usedFunctionTool = functionCalls.length > 0;
```


然后把估算成本也一起返回。

### 今天的完成标准

三个 API 至少有一个已经能返回：

- usage

- latencyMs

- estimatedCostUsd

---

## 周四，下班后 1–1.5 小时

目标：做前端本地 ops store。

这周先不用数据库，和 Week 4 一样，先用 `localStorage`。

### 新建

```Plain Text
src/lib/ops-store.ts
```


### 代码骨架

```TypeScript
import type { OpLog } from "@/types/op-log";

const STORAGE_KEY = "ai-workspace-lite-ops";

export function getOpLogs(): OpLog[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveOpLogs(logs: OpLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function addOpLog(log: OpLog) {
  const logs = getOpLogs();
  logs.unshift(log);
  saveOpLogs(logs.slice(0, 50));
}
```


### 接入方式

在 `/extract`、`/docs`、`/workspace` 对应页面请求成功后，把返回里的 usage / latency / cost 存进去。

### 今天的完成标准

你能在浏览器里看到最近请求被记下来。

---

## 周五，下班后 1 小时

目标：做 `/ops` 页面。

这个页面先不要花哨，只做一张可读列表。

### 页面至少显示

- route

- model

- input / output / total tokens

- latency

- estimated cost

- usedFileSearch

- usedFunctionTool

- createdAt

### 推荐页面结构

上面放 3 个统计卡片：

- 最近请求数

- 平均 latency

- 总估算成本

下面放最近请求表。

### 今天的完成标准

你能打开 `/ops`，看到过去几次操作的记录。

---

## 周六，4–6 小时

目标：做一次真正的“优化实验”。

今天只做一条闭环：

### 1. 跑 3 类请求

- extract 3 次

- docs 3 次

- task 3 次

### 2. 看 `/ops`

判断：

- 谁最慢

- 谁最贵

- 谁 token 最多

### 3. 做一次简单优化

你从下面 4 个里只选 1–2 个做：

#### 方案 A：限制输出上限

在某个 route 里加 `max_output_tokens`。Responses API 参考明确写了它可以限制可生成的总输出 token。([platform.openai.com](https://platform.openai.com/docs/api-reference/responses/retrieve?utm_source=chatgpt.com))

#### 方案 B：减少无用说明文字

精简某个 prompt 的重复前缀。

#### 方案 C：对 extract 保持 `gpt-5-mini`

如果你之前想换更强模型，这周先通过数据判断是否有必要。

#### 方案 D：给长前缀场景开始做 prompt caching 友好整理

也就是把静态 instructions 放前面，把用户变量放后面。官方 prompt caching 最佳实践明确建议这样组织 prompt。([platform.openai.com](https://platform.openai.com/docs/guides/prompt-caching?utm_source=chatgpt.com))

### 4. 再跑一轮

做一版“优化前 vs 优化后”对比。

### 周六完成标准

你至少拿到一个可讲的结论，例如：

- “extract 的输出 token 偏多，限制后延迟下降”

- “docs 的成本主要来自 file_search”

- “task 路由其实不贵，问题更多在工具触发稳定性”

---

## 周日，3–4 小时

目标：作品化。

今天做 4 件事：

### 1. README 增量

补 Week 7 章节

### 2. 录 1–2 分钟 Demo

演示 `/ops` 页面和一次优化前后对比

### 3. 写 3 条观察结论

建议格式：

- 最慢的 route 是谁，为什么

- 最贵的 route 是谁，为什么

- 哪个 route 后面最值得继续优化

### 4. 写一页本周复盘

文件名建议：

```Plain Text
docs/ops-retro-week7.md
```


内容只回答：

- 我现在终于能看见什么

- 我还看不见什么

- 下周如果继续做，我最想补哪一层

---

# 推荐目录增量

```Plain Text
docs/
  ops-week7.md
  ops-retro-week7.md

src/
  app/
    ops/
      page.tsx
  lib/
    cost.ts
    ops-store.ts
  types/
    op-log.ts
```


---

# 关键代码改法

## 1）在 route 返回里加入 metrics

你在 `/api/extract` 这类路由里返回：

```TypeScript
return NextResponse.json({
  result: response.output_parsed,
  model: DEFAULT_MODEL,
  metrics: {
    inputTokens,
    outputTokens,
    totalTokens,
    cachedTokens: usage.input_tokens_details?.cached_tokens || 0,
    latencyMs,
    estimatedCostUsd,
    usedFileSearch: false,
    usedFunctionTool: false,
  },
});
```


如果是 `/api/ask-docs`，就把 `usedFileSearch: true`，并带上 `fileSearchCalls` 参与成本估算。

官方 prompt caching 文档还说明，usage 里会出现 `cached_tokens` 字段，可用于观察缓存命中情况。([platform.openai.com](https://platform.openai.com/docs/guides/prompt-caching?utm_source=chatgpt.com))

## 2）前端请求成功后写入 ops store

例如在 `/docs` 页面请求成功后：

```Plain Text
addOpLog({
  id: crypto.randomUUID(),
  route: "docs",
  model: data.model,
  inputTokens: data.metrics.inputTokens,
  outputTokens: data.metrics.outputTokens,
  totalTokens: data.metrics.totalTokens,
  cachedTokens: data.metrics.cachedTokens,
  latencyMs: data.metrics.latencyMs,
  usedFileSearch: data.metrics.usedFileSearch,
  usedFunctionTool: data.metrics.usedFunctionTool,
  estimatedCostUsd: data.metrics.estimatedCostUsd,
  createdAt: new Date().toISOString(),
});
```


## 3）最小 `/ops` 页面骨架

```Plain Text
"use client";

import { useEffect, useMemo, useState } from "react";
import { getOpLogs } from "@/lib/ops-store";
import type { OpLog } from "@/types/op-log";

export default function OpsPage() {
  const [logs, setLogs] = useState<OpLog[]>([]);

  useEffect(() => {
    setLogs(getOpLogs());
  }, []);

  const summary = useMemo(() => {
    const total = logs.length;
    const avgLatency =
      total ? logs.reduce((sum, x) => sum + x.latencyMs, 0) / total : 0;
    const totalCost =
      total ? logs.reduce((sum, x) => sum + x.estimatedCostUsd, 0) : 0;

    return {
      total,
      avgLatency: Math.round(avgLatency),
      totalCost: totalCost.toFixed(6),
    };
  }, [logs]);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Ops Lite v1</h1>
        <p className="text-sm text-gray-600">
          查看最近请求的 token、延迟、工具使用和估算成本。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">最近请求数</div>
          <div className="text-2xl font-bold">{summary.total}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">平均延迟</div>
          <div className="text-2xl font-bold">{summary.avgLatency} ms</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">总估算成本</div>
          <div className="text-2xl font-bold">${summary.totalCost}</div>
        </div>
      </section>

      <section className="rounded-xl border p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Route</th>
              <th>Model</th>
              <th>Total Tokens</th>
              <th>Latency</th>
              <th>Cost</th>
              <th>File Search</th>
              <th>Function Tool</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td>{log.route}</td>
                <td>{log.model}</td>
                <td>{log.totalTokens}</td>
                <td>{log.latencyMs} ms</td>
                <td>${log.estimatedCostUsd}</td>
                <td>{log.usedFileSearch ? "Yes" : "No"}</td>
                <td>{log.usedFunctionTool ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
```


---

# Week 7 README 增量模板

把这段加到 `README.md`：

```Plain Text
## Week 7 - Ops Lite v1

### 本周目标
为 AI Workspace Lite Alpha 增加最基础的成本、延迟和请求日志观测能力。

### 本周做了什么
- 在 extract / docs / task 路由记录 usage 和 latency
- 增加本地 ops store
- 新增 /ops 页面查看最近请求
- 加入基础成本估算
- 做了一次优化前后对比实验

### 为什么重要
AI 应用工程不只是“功能能跑”，还要知道：
- 哪类请求最慢
- 哪类请求最贵
- 哪些优化真的有效

### 本周复盘
#### 最慢的 route
- 

#### 最贵的 route
- 

#### 最有效的一次优化
- 
```


---

# Week 7 Demo 脚本

周日录视频直接按这个顺序：

11. 打开 `/extract`，跑一次请求

12. 打开 `/docs`，跑一次带 file search 的请求

13. 打开 `/workspace`，跑一次 task 请求

14. 打开 `/ops`

15. 展示最近 3 条日志

16. 说明哪个 route 最慢、哪个最贵

17. 展示你做过的一次优化前后对比

18. 总结：这周开始，你不再只是“会用模型”，而是开始“会观察系统”

---

# 这周最容易踩的 3 个坑

第一，**把估算成本当精确账单**。
这周的成本数字更适合做工程决策和趋势判断，不是拿来对账单逐分逐厘对齐。官方 pricing 给了公开单价，但真实账单还会受工具调用、缓存命中、服务层级等因素影响。([platform.openai.com](https://platform.openai.com/docs/pricing/?utm_source=chatgpt.com) ([OpenAI平台](https://platform.openai.com/docs/pricing/?utm_source=chatgpt.com)))

第二，**只盯模型，不盯 token 和请求数**。
官方 latency/cost 指南都强调，减少请求、减少输入输出 token，往往和换模型一样甚至更有效。([platform.openai.com](https://platform.openai.com/docs/guides/cost-optimization?utm_source=chatgpt.com) ([OpenAI平台](https://platform.openai.com/docs/guides/cost-optimization?utm_source=chatgpt.com)))

第三，**什么都交给 LLM**。
官方 latency optimization 直接把“Don’t default to an LLM”列为原则之一。对你现在这个项目，这意味着像简单状态切换、过滤、排序、格式转换这些事情，不该都走模型。([platform.openai.com](https://platform.openai.com/docs/guides/latency-optimization?utm_source=chatgpt.com))

---

# 这周做完后，你真正得到的是什么

不是一个更炫的页面，而是这 4 个职业化能力：

- 你开始把 AI 请求当成可观测的系统调用

- 你开始能用数据判断模型和 prompt 的取舍

- 你开始意识到 file search、tool calls、tokens 都是成本项

- 你开始具备“优化前先测量”的工程习惯

这一步很关键，因为到了 Week 7，你已经从“会做 AI 功能”继续往“会维护 AI 应用”走了。

下一条我可以直接给你 **Week 8 的执行版**。

