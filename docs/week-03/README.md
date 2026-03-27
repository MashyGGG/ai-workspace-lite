下面是 **Week 3 的执行版**，按你现在的时间节奏来排：**工作日 1–2 小时，周末完成整合**。

这周只做一个成果：

# Doc QA v1

> **本仓库实现（国内 Kimi）**：未使用 OpenAI `file_search` / vector store，而是**本地索引 + 将文档拼入 `ask-docs` 的 system 上下文**；示例代码中的 `OPENAI_API_KEY` 与本仓库无关。说明见 [domestic-llm.md](../domestic-llm.md)。

把 3–5 份本地文档接进 OpenAI 的 `file_search`，然后在网页里提问，返回**答案 + 引用来源 + 检索结果预览**。`file_search` 是 Responses API 的内建工具；使用时需要先准备一个 vector store，并在 `responses.create` 里传 `tools: [{ type: "file_search", vector_store_ids: [...] }]`。如果你加上 `include: ["file_search_call.results"]`，还能把检索结果带回来做排查；回答里的 annotations 也会带文件引用信息。vector store 在未显式设置时会使用 `auto` chunking strategy。([OpenAI 平台](https://platform.openai.com/docs/guides/tools-file-search?lang=javascript))

---

## 这周的完成标准

到周日，你要拿到这 5 个结果：

1. 本地有 `sample-docs/`，里面放了 3–5 份样例文档

2. 你能跑脚本把这些文档上传进一个 vector store

3. 网页里能输入问题并返回答案

4. 页面能显示至少一个引用文件名

5. 页面能显示检索结果预览，方便你判断是“没检索到”还是“总结错了” ([OpenAI 平台](https://platform.openai.com/docs/guides/tools-file-search?lang=javascript))

---

## 先别做什么

这周先不要做：

- 浏览器端文件上传

- 自建向量库

- 自己做 chunking

- 登录 / 权限

- 多文档管理后台

先把主链路跑通最重要。

---

# 每日执行安排

## 周一：理解链路，建目录

用 60–90 分钟完成这几件事：

6. 新建目录

```Shell
mkdir -p sample-docs scripts src/app/docs src/app/api/ask-docs src/components src/types
```


7. 在 `sample-docs/` 放 3 份短文档
建议先用 `.md` 和 `.txt`，别一上来全是复杂 PDF。

8. 写一页笔记 `notes/week3-day1.md`，只回答 3 个问题：

- 为什么这周先用 hosted `file_search`

- 为什么先不自建 RAG

- 为什么“引用”比“答得像对的”更重要

---

## 周二：准备样例文档 + 上传脚本

今天目标是把“文档”这件事准备好。

### 建议文档

`sample-docs/product.md`

```Plain Text
# AI Workspace Lite

当前支持：
1. Prompt Lab
2. Structured Extractor
3. Doc QA

当前暂不支持：
- 多工作区权限隔离
- 自动执行高风险动作
- 外部系统集成
```


`sample-docs/roadmap.md`

```Plain Text
# 路线图

Week 1: Prompt Lab v1
Week 2: Structured Extractor v1
Week 3: Doc QA v1
Week 4: 整合成 AI Workspace Lite Alpha，并加入最小工具调用
```


`sample-docs/faq.txt`

```Plain Text
Q: 当前支持哪些能力？
A: Prompt Lab、Structured Extractor、Doc QA。

Q: 当前是否支持多工作区权限？
A: 暂不支持。

Q: Week 4 的目标是什么？
A: 把前三周功能整合成 AI Workspace Lite Alpha，并加入最小工具调用。
```


### 新建脚本

`scripts/setup-vector-store.mjs`

```JavaScript
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const docsDir = path.join(process.cwd(), "sample-docs");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadOne(filePath) {
  const file = fs.createReadStream(filePath);
  const uploaded = await openai.files.create({
    file,
    purpose: "assistants",
  });
  return uploaded.id;
}

async function main() {
  const names = fs.readdirSync(docsDir).filter((name) => {
    const ext = path.extname(name).toLowerCase();
    return [".md", ".txt", ".pdf", ".docx"].includes(ext);
  });

  if (!names.length) {
    throw new Error("sample-docs 目录下没有可上传文件");
  }

  const vectorStore = await openai.vectorStores.create({
    name: "week3-doc-qa-store",
  });

  console.log("Vector Store ID:", vectorStore.id);

  for (const name of names) {
    const filePath = path.join(docsDir, name);
    const fileId = await uploadOne(filePath);

    await openai.vectorStores.files.create(vectorStore.id, {
      file_id: fileId,
    });

    console.log("attached:", name, "=>", fileId);
  }

  let done = false;
  while (!done) {
    const list = await openai.vectorStores.files.list({
      vector_store_id: vectorStore.id,
    });

    const statuses = list.data.map((x) => ({
      id: x.id,
      status: x.status,
    }));

    console.log(statuses);

    done = statuses.every(
      (x) => x.status === "completed" || x.status === "failed"
    );

    if (!done) await sleep(3000);
  }

  console.log("\n写入 .env.local：");
  console.log(`OPENAI_VECTOR_STORE_ID=${vectorStore.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```


OpenAI 官方的 file search 用法就是先上传文件、创建 vector store、把文件加入 store，然后在响应请求里引用这个 store。([OpenAI 平台](https://platform.openai.com/docs/guides/tools-file-search?lang=javascript))

---

## 周三：跑脚本，拿到 vector store id

今天只做这一条主线。

9. 确保 `.env.local` 已有：

```Plain Text
OPENAI_API_KEY=你的key
OPENAI_MODEL=gpt-5-mini
```


10. 运行：

```Shell
node scripts/setup-vector-store.mjs
```


11. 把输出的 id 写回 `.env.local`

```Plain Text
OPENAI_VECTOR_STORE_ID=vs_xxx
```


12. 验收

- 脚本能跑完

- 所有文件状态到 `completed` 或 `failed`

- 你拿到了一个可用的 `OPENAI_VECTOR_STORE_ID`

官方文档明确要求先准备 vector store，然后在 `file_search` tool 里传 `vector_store_ids`。([OpenAI 平台](https://platform.openai.com/docs/guides/tools-file-search?lang=javascript))

---

## 周四：做后端问答接口

今天做 `/api/ask-docs`。

新建 `src/types/doc-qa.ts`：

```TypeScript
export type Citation = {
  fileId: string;
  filename: string;
  index?: number;
};

export type SearchResultItem = {
  filename?: string;
  score?: number;
  text?: string;
};

export type DocQAResponse = {
  answer: string;
  citations: Citation[];
  searchResults: SearchResultItem[];
  model?: string;
};
```


新建 `src/app/api/ask-docs/route.ts`：

```TypeScript
import { NextRequest, NextResponse } from "next/server";
import { openai, DEFAULT_MODEL } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

    if (!question?.trim()) {
      return NextResponse.json({ error: "请输入问题" }, { status: 400 });
    }

    if (!vectorStoreId) {
      return NextResponse.json(
        { error: "缺少 OPENAI_VECTOR_STORE_ID" },
        { status: 500 }
      );
    }

    const response = await openai.responses.create({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content:
            "你是一个文档问答助手。优先基于检索到的文件内容回答；如果文档中没有足够依据，请明确说明“未在文档中找到足够依据”。不要编造。",
        },
        {
          role: "user",
          content: question,
        },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [vectorStoreId],
          max_num_results: 4,
        },
      ],
      include: ["file_search_call.results"],
    });

    const messages = (response.output || []).filter(
      (item: any) => item.type === "message"
    );

    const textParts = messages.flatMap((m: any) =>
      (m.content || []).filter((c: any) => c.type === "output_text")
    );

    const answer = textParts.map((p: any) => p.text || "").join("\n");

    const citations = textParts.flatMap((p: any) =>
      (p.annotations || [])
        .filter((a: any) => a.type === "file_citation")
        .map((a: any) => ({
          fileId: a.file_id,
          filename: a.filename,
          index: a.index,
        }))
    );

    const searchCalls = (response.output || []).filter(
      (item: any) => item.type === "file_search_call"
    );

    const searchResults = searchCalls.flatMap((call: any) =>
      (call.results || []).map((r: any) => ({
        filename: r.filename,
        score: r.score,
        text: r.text,
      }))
    );

    return NextResponse.json({
      answer,
      citations,
      searchResults,
      model: DEFAULT_MODEL,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "文档问答失败" }, { status: 500 });
  }
}
```


这里的关键点都来自官方：

- `file_search` 作为 built-in tool 放进 `tools`

- 通过 `vector_store_ids` 关联知识库

- `include: ["file_search_call.results"]` 用来回传检索结果

- 输出里的 annotations 可包含文件引用信息 ([OpenAI 平台](https://platform.openai.com/docs/guides/tools-file-search?lang=javascript))

---

## 周五：做最小前端

今天做 `/docs` 页面，先不要美化。

`src/components/DocAnswerCard.tsx`

```Plain Text
export function DocAnswerCard({
  answer,
  model,
}: {
  answer: string;
  model?: string;
}) {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="text-sm text-gray-500">{model ? `模型：${model}` : "回答"}</div>
      <pre className="whitespace-pre-wrap text-sm leading-6">{answer}</pre>
    </div>
  );
}
```


`src/components/CitationList.tsx`

```Plain Text
import type { Citation } from "@/types/doc-qa";

export function CitationList({ citations }: { citations: Citation[] }) {
  const unique = citations.filter(
    (item, index, arr) =>
      index === arr.findIndex((x) => x.fileId === item.fileId)
  );

  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">引用来源</h2>
      {unique.length ? (
        <ul className="space-y-2 text-sm">
          {unique.map((item) => (
            <li key={item.fileId} className="rounded-lg bg-gray-50 p-3">
              {item.filename || item.fileId}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">没有返回明确引用</p>
      )}
    </div>
  );
}
```


`src/components/SearchResultsPreview.tsx`

```Plain Text
import type { SearchResultItem } from "@/types/doc-qa";

export function SearchResultsPreview({
  items,
}: {
  items: SearchResultItem[];
}) {
  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">检索结果预览</h2>
      {items.length ? (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={idx} className="rounded-lg bg-gray-50 p-3 text-sm">
              <div><strong>文件：</strong>{item.filename || "未知文件"}</div>
              <div><strong>分数：</strong>{item.score ?? "未知"}</div>
              <div className="mt-2 whitespace-pre-wrap text-gray-700">
                {item.text || "无文本预览"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">当前未返回检索结果</p>
      )}
    </div>
  );
}
```


`src/app/docs/page.tsx`

```Plain Text
"use client";

import { useState } from "react";
import type { DocQAResponse } from "@/types/doc-qa";
import { DocAnswerCard } from "@/components/DocAnswerCard";
import { CitationList } from "@/components/CitationList";
import { SearchResultsPreview } from "@/components/SearchResultsPreview";

export default function DocsPage() {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState<DocQAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/ask-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "请求失败");

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Doc QA v1</h1>
        <p className="text-sm text-gray-600">基于已上传文档进行带引用问答。</p>
      </header>

      <section className="space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={6}
          placeholder="例如：当前版本支持哪些能力？Week 4 的目标是什么？"
          className="w-full rounded-lg border px-3 py-2"
        />

        <div className="flex gap-3">
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "检索中..." : "开始提问"}
          </button>

          <button
            onClick={() => {
              setQuestion("");
              setData(null);
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

      {data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <DocAnswerCard answer={data.answer} model={data.model} />
            <CitationList citations={data.citations} />
          </div>
          <SearchResultsPreview items={data.searchResults || []} />
        </div>
      ) : null}
    </main>
  );
}
```


---

## 周六：联调 + 测试问题

今天做整合测试。

### 测试问题就用这 4 条

13. 当前版本支持哪些能力？

14. 当前是否支持多工作区权限隔离？

15. Week 4 的目标是什么？

16. 这个项目当前支持外部系统集成吗？

### 今天验收

- 4 个问题至少 3 个答对

- 至少 1 个问题返回引用

- 检索结果预览能看到相关片段

---

## 周日：README + Demo + 失败案例

今天只做作品化。

### README 增量

```Plain Text
## Week 3 - Doc QA v1

### 本周目标
基于已上传文档做带引用问答，而不是只依赖模型固有知识。

### 核心能力
- 创建 vector store
- 上传本地文件
- 使用 Responses API + file_search
- 显示引用来源
- 显示检索结果预览

### 本周复盘
#### 哪些问题答得好
- 

#### 哪些问题没有答好
- 

#### 我判断是检索问题还是总结问题
- 
```


### Demo 脚本

你录视频时就按这个顺序：

17. 展示 `sample-docs/` 有 3 份文档

18. 打开 `/docs` 页面

19. 问“当前版本支持哪些能力？”

20. 展示回答

21. 展示引用来源

22. 展示检索结果预览

23. 再问一个文档里没有的内容，观察是否保守回答

### 失败案例模板

```Plain Text
# Week 3 Failure Case

## 问题
我问了：

## 现象
回答不完整 / 没有引用 / 检索结果为空

## 我的判断
- [ ] 检索没取到
- [ ] 取到了但总结偏了
- [ ] 问题本身太泛

## 下周准备怎么改
```


---

# 这周最重要的 3 个判断标准

第一，**先看有没有引用，再看答得漂不漂亮**。
第二，**先看检索结果有没有相关片段，再判断是不是模型总结问题**。
第三，**先把 hosted `file_search` 基线跑通，再考虑自建 RAG**。官方文档已经把 `file_search` 作为内建工具主线给出了标准用法。([OpenAI 平台](https://platform.openai.com/docs/guides/tools-file-search?lang=javascript))

---

# 你这周最终应该长这样

目录至少有这些：

```Plain Text
sample-docs/
scripts/
  setup-vector-store.mjs
src/
  app/
    api/
      ask-docs/
        route.ts
    docs/
      page.tsx
  components/
    CitationList.tsx
    DocAnswerCard.tsx
    SearchResultsPreview.tsx
  types/
    doc-qa.ts
```


---

# 一个很实用的提醒

如果你周三卡在上传或 store 初始化，不要硬拖到周四。
那就直接把周四的前端时间拿来排查脚本，先保证 **vector store + API 路由** 打通。
这周真正的关键，不是页面，而是这条链：

**本地文档 → vector store → file_search → 回答 → 引用**

