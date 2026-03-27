下面给你一版**更适合直接执行的 Week 4 执行版**。这周的核心不是继续加新能力，而是把前 3 周的 Prompt Lab、Structured Extractor、Doc QA 整合成一个**模块化单体**的小应用，再补一个最小工具调用闭环。这也和你文档里“前 4–6 周尽量模块化单体、不要过早拆服务”和“把聊天框做成产品界面”的方向一致。

## 本周唯一目标

做出 **AI Workspace Lite Alpha**：

- 有统一导航和首页

- 有 `/extract`、`/docs`、`/workspace` 三个页面

- 有一个最小工具 `create_task`

- 能完成一条完整路径：
**抽取/问答结果 → 触发创建任务 → 任务列表可见**

OpenAI 当前把 Responses API 作为统一入口，支持内建 tools 和 function calling；function calling 是一个**多步流程**：模型返回 `function_call`，你的应用执行工具，再把 `function_call_output` 回传模型拿最终回答。([OpenAI 平台](https://platform.openai.com/docs/api-reference/responses/retrieve?utm_source=chatgpt.com))

---

## 本周结束的验收标准

到周日，你至少要满足这 5 条：

1. 首页能进入三个功能页

2. `/extract` 和 `/docs` 还能正常用

3. `/workspace` 可以触发一次 AI 创建任务

4. 任务能显示在列表里，并且刷新后还在

5. 你能录一个 2–3 分钟 Demo，完整演示“分析 → 行动”这条链路

---

## 这周先不要做

先别加这些：

- 多 agent

- 数据库

- 真正的登录权限

- 自动执行高风险动作

- 对话持久化

- 自建状态机框架

你文档里已经很明确：这个阶段优先做**产品骨架和连续用户路径**，不要过早把架构拆碎。

---

# 每日执行版

## 周一，下班后 1–1.5 小时

目标：把前 3 周页面收进一个壳子里。

今天做：

- 新建统一导航 `AppNav`

- 新建首页 `/`

- 新建工作台页 `/workspace`

- 把导航挂到 `layout.tsx`

### 今天要改的文件

```Plain Text
src/components/AppNav.tsx
src/app/page.tsx
src/app/workspace/page.tsx
src/app/layout.tsx
```


### 今天的完成标准

你能从导航点到：

- Home

- Extract

- Docs

- Workspace

---

## 周二，下班后 1–1.5 小时

目标：加最小任务存储。

这周先不用数据库，直接用 `localStorage`。
因为你现在要的是**演示完整流程**，不是先做复杂基础设施。

### 今天做

定义任务对象：

```TypeScript
type Task = {
  id: string;
  title: string;
  source: "extract" | "docs";
  status: "open" | "done";
  createdAt: string;
}
```


再做 3 个方法：

- `getTasks()`

- `saveTasks()`

- `addTask()`

### 今天要改的文件

```Plain Text
src/types/task.ts
src/lib/task-store.ts
```


### 今天的完成标准

你在浏览器控制台里手动调用 `addTask()` 后，刷新页面，任务还在。

---

## 周三，下班后 1–1.5 小时

目标：定义最小工具，不碰复杂 UI。

这周只做一个工具：

# `create_task`

参数就两个：

- `title`

- `source`

这样足够体现：

- tool schema

- 参数约束

- side effect

OpenAI 的 function tools 需要你用 JSON Schema 描述参数；模型返回的 `function_call` 会包含 `name` 和 JSON 编码的 `arguments`。([OpenAI 平台](https://platform.openai.com/docs/guides/function-calling?api-mode=responses&utm_source=chatgpt.com))

### 今天做

- 写工具定义

- 写工具执行函数

### 今天要改的文件

```Plain Text
src/tools/create-task.ts
src/tools/index.ts
```


### 今天的完成标准

你不用模型，直接调用 `createTask({ title, source })` 就能得到一个任务对象。

---

## 周四，下班后 1.5–2 小时

目标：打通 function calling 闭环。

这是这周最关键的一天。

### 今天做

新建 `/api/agent-task`：

6. 接收 `text` 和 `source`

7. 调一次 Responses API，并把 `create_task` 作为 function tool 传进去

8. 解析 `function_call`

9. 本地执行 `createTask`

10. 再调一次 Responses API，把 `function_call_output` 传回去

11. 返回：

  - `message`

  - `createdTask`

这就是官方 function calling 的标准模式。([OpenAI 平台](https://platform.openai.com/docs/guides/function-calling?api-mode=responses&utm_source=chatgpt.com))

### 今天要改的文件

```Plain Text
src/app/api/agent-task/route.ts
```


### 今天的完成标准

你用 Postman 或页面请求一句：

> 根据这段内容，帮我创建一个跟进任务

接口能返回：

- 一条自然语言确认

- 一个 `createdTask`

---

## 周五，下班后 1 小时

目标：把工具调用放进最小前端。

### 今天做

在 `/workspace` 做最小面板：

- 文本输入框

- 来源选择：`extract` / `docs`

- “让 AI 处理”按钮

- 返回消息展示区

- 任务列表展示区

### 今天要改的文件

```Plain Text
src/components/AgentTaskPanel.tsx
src/components/TaskList.tsx
src/app/workspace/page.tsx
```


### 今天的完成标准

你已经可以从 UI 触发一次工具调用，并在页面上看到任务。

---

## 周六，4–6 小时

目标：把前三周功能整成一个“小产品”。

今天做 4 件事。

### 第一件：整理首页

首页放 3 个功能卡片：

- Prompt Lab

- Structured Extractor

- Doc QA

### 第二件：完善 Workspace

至少包括：

- AI 任务助手

- 当前任务列表

### 第三件：把 Extract 和 Docs 接到 Workspace

你不用今天就做复杂自动化。
最稳的做法是：

- 在 `/extract` 结果区加按钮：`保存为任务`

- 在 `/docs` 回答区加按钮：`把结论生成任务`

这就已经符合你文档里提到的“来源、状态、可操作入口”的产品界面方向。

### 第四件：跑通完整用户路径

至少确保这条路径成立：

**输入内容 → 得到结构化结果或带引用回答 → 触发任务创建 → Workspace 看到新任务**

### 周六验收

你能从任一页面生成一个任务，并在 Workspace 看到它。

---

## 周日，3–4 小时

目标：作品化。

### 今天做

12. 补 README 的 Week 4 章节

13. 录 2–3 分钟 Demo

14. 写 1 个失败案例

15. 画 1 张简单架构图

### 失败案例建议写这个

- 现象：模型没有触发工具

- 原因猜测：

  - 工具描述太弱

  - 用户意图不够明确

  - schema 太松

- 修复思路：

  - system prompt 更明确

  - 工具描述改成“用户提到跟进、保存、待办时优先调用”

  - 把标题要求改成“简洁明确、可直接执行”

---

# 推荐目录结构

这周结束时，目录建议长这样：

```Plain Text
src/
├─ app/
│  ├─ api/
│  │  └─ agent-task/
│  │     └─ route.ts
│  ├─ docs/
│  │  └─ page.tsx
│  ├─ extract/
│  │  └─ page.tsx
│  ├─ workspace/
│  │  └─ page.tsx
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ AppNav.tsx
│  ├─ AgentTaskPanel.tsx
│  └─ TaskList.tsx
├─ lib/
│  └─ task-store.ts
├─ tools/
│  ├─ create-task.ts
│  └─ index.ts
└─ types/
   └─ task.ts
```


---

# 这周最小代码骨架

## 1. `src/types/task.ts`

```TypeScript
export type Task = {
  id: string;
  title: string;
  source: "extract" | "docs";
  status: "open" | "done";
  createdAt: string;
};
```


## 2. `src/lib/task-store.ts`

```TypeScript
import type { Task } from "@/types/task";

const STORAGE_KEY = "ai-workspace-lite-tasks";

export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function addTask(task: Task) {
  const tasks = getTasks();
  tasks.unshift(task);
  saveTasks(tasks);
}
```


## 3. `src/tools/create-task.ts`

```TypeScript
export type CreateTaskInput = {
  title: string;
  source: "extract" | "docs";
};

export function createTask(input: CreateTaskInput) {
  return {
    id: crypto.randomUUID(),
    title: input.title,
    source: input.source,
    status: "open" as const,
    createdAt: new Date().toISOString(),
  };
}
```


## 4. `src/tools/index.ts`

```TypeScript
export const createTaskTool = {
  type: "function" as const,
  name: "create_task",
  description: "为当前结论或后续动作创建一个待办任务",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: {
        type: "string",
        description: "任务标题，应简洁明确，可直接执行",
      },
      source: {
        type: "string",
        enum: ["extract", "docs"],
        description: "任务来源页面",
      },
    },
    required: ["title", "source"],
  },
};
```


OpenAI 官方 function calling 指南说明，function tool 需要 JSON Schema，模型输出里会出现 `function_call`，之后要把工具结果作为 `function_call_output` 送回去。([OpenAI 平台](https://platform.openai.com/docs/guides/function-calling?api-mode=responses&utm_source=chatgpt.com))

## 5. `src/app/api/agent-task/route.ts`

```TypeScript
import { NextRequest, NextResponse } from "next/server";
import { openai, DEFAULT_MODEL } from "@/lib/openai";
import { createTask } from "@/tools/create-task";
import { createTaskTool } from "@/tools";

export async function POST(req: NextRequest) {
  try {
    const { text, source } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "请输入内容" }, { status: 400 });
    }

    const first = await openai.responses.create({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content:
            "你是一个工作台助手。如果用户请求创建待办或跟进事项，请优先调用 create_task。任务标题要简洁明确。",
        },
        {
          role: "user",
          content: `来源页面：${source || "docs"}\n内容：${text}`,
        },
      ],
      tools: [createTaskTool],
    });

    const functionCalls = (first.output || []).filter(
      (item: any) => item.type === "function_call"
    );

    if (!functionCalls.length) {
      return NextResponse.json({
        message: first.output_text || "未触发任务创建。",
        createdTask: null,
      });
    }

    const call = functionCalls[0];
    const args = JSON.parse(call.arguments || "{}");

    const createdTask = createTask({
      title: args.title,
      source: args.source || source || "docs",
    });

    const second = await openai.responses.create({
      model: DEFAULT_MODEL,
      input: [
        ...first.output,
        {
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(createdTask),
        },
      ],
    });

    return NextResponse.json({
      message: second.output_text || "任务已创建。",
      createdTask,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "任务处理失败" }, { status: 500 });
  }
}
```


---

# 本周 Demo 脚本

周日录视频，按这个顺序：

16. 打开首页，说明这是 AI Workspace Lite Alpha

17. 进 `/extract`，输入一段需求描述，展示结构化结果

18. 进 `/docs`，问一个文档问题，展示带引用回答

19. 进 `/workspace`

20. 输入：
“根据这段结论，帮我创建一个跟进任务：确认 Week 4 整合页和最小工具调用闭环”

21. 展示任务被创建

22. 展示任务列表

23. 最后总结：这周重点不是多 agent，而是把三个功能变成一条连续工作流

---

# 本周 README 增量模板

```Plain Text
## Week 4 - AI Workspace Lite Alpha

### 本周目标
把 Prompt Lab、Structured Extractor 和 Doc QA 整合成一个小型 AI 工作台，并加入一个最小工具调用闭环。

### 核心能力
- 页面导航和信息架构
- 本地任务存储
- function calling 工具定义
- create_task 工具执行
- function_call_output 回传模型
- 任务列表展示

### 为什么重要
这一周标志着项目从“多个功能 demo”变成“一个连续应用”。

### 本周复盘
#### 整合后最顺的用户路径
- 

#### 工具调用哪里不稳定
- 

#### 下周准备补什么
- 
```


---

# 这周最容易卡住的 3 个点

第一，**模型不一定会调工具**。
所以你的 system prompt 和 tool description 要非常明确。官方也提醒要假设模型可能返回 0 个、1 个或多个 function call。([OpenAI 平台](https://platform.openai.com/docs/guides/function-calling?api-mode=responses&utm_source=chatgpt.com))

第二，**不要把 Week 4 做成“第二次重构周”**。
这周的目标是整合，不是推翻 Week 1–3 重写一遍。

第三，**先做一个工具并把它做对**。
你文档里也强调了工具调用、结构化结果渲染和任务进度这些产品界面能力，是你相对纯后端/纯模型路线的优势。

---

# 最后一句话帮你收口

Week 4 做完，你的项目就会从：

- 一个 prompt 页面

- 一个结构化抽取页面

- 一个文档问答页面

变成：

- 一个有导航

- 有工作台

- 有任务闭环

- 有最小工具调用

- 能连续演示的 AI 应用 Alpha

如果你要，我下一条就直接给你 **Week 5 的执行版**，继续把这个 Alpha 接上最小 eval。

