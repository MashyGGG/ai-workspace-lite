下面是 **Week 5 的执行版**。
这周不加大功能，核心只有一句话：

# 给你的 Alpha 补上“最小 eval 护栏”

OpenAI 现在把 evals 放在构建可靠 LLM 应用的核心位置：官方建议先定义系统应如何表现，再跑测试输入，再分析结果并迭代；如果你想快速起步，官方建议先用 **Datasets** 做快速实验，若需要程序化、大规模或更高级的评测，再用 **Evals API**；而对于 agent 级工作流错误，官方还专门建议看 **trace grading**。([OpenAI 平台](https://platform.openai.com/docs/guides/evals?lang=javascript&utm_source=chatgpt.com))

结合你现在的时间，我建议 **Week 5 先做本地 Eval Harness v1**，不用一上来接完整 Evals API。原因很简单：
你现在更需要建立“改动—回归—结果对比”的习惯，而不是先搭重平台。等 Week 7/8 再决定要不要把本地数据迁到 OpenAI Datasets / Evals。这个顺序和官方“Datasets 快速迭代，Evals 做程序化与规模化”的定位是吻合的。([OpenAI 平台](https://platform.openai.com/docs/guides/evaluation-getting-started?utm_source=chatgpt.com))

---

## 本周唯一目标

做出 **Eval Harness v1**，至少覆盖你当前 3 条主链：

- `/extract` 的结构化抽取

- `/docs` 的带引用问答

- `/api/agent-task` 的最小工具调用

---

## 本周结束的验收标准

到周日，你至少要达到这 6 条：

1. 你有一份 `evals/dataset_v1.jsonl`

2. 至少有 **20 条样本**

3. 样本分成 3 类：

  - extract

  - docs

  - task

4. 你能一键跑批量评测

5. 你能输出一份 Markdown 报告

6. 你改一次 prompt 或 tool 描述后，能知道哪类变好了，哪类变差了

---

## 这周先不要做

先不做这些：

- 接 OpenAI Evals API

- 接 Dashboard 的 Datasets UI

- LLM-as-a-judge

- 很复杂的 grader

- 自动化 CI

这周先把“**评测心智 + 本地回归脚本**”立住。

---

# 这周你要评什么

## 1）Extract

看 3 件事：

- 是否有 summary

- 是否抽出关键 actionItems

- 是否乱编 risks / openQuestions

## 2）Docs

看 3 件事：

- 是否答对

- 是否有引用

- 文档无依据时是否保守回答

## 3）Task

看 2 件事：

- 是否真的触发了任务创建

- 任务标题是否足够明确

---

# 为什么这样设计

OpenAI 的 graders 文档把 grader 分成好几类，包括 string check、text similarity、score model grader 和 python grader；本地第一版最适合你的，是**规则型 grader**，因为它简单、可解释、维护成本低。官方也明确说，设计 grader 应该从小开始、不断迭代。([OpenAI 平台](https://platform.openai.com/docs/guides/graders/?utm_source=chatgpt.com))

所以这周你先不用追求“最智能评测”，先做到：

- 关键字命中

- 是否含引用

- 是否拒绝胡编

- 是否触发工具

这已经足够支撑你当前阶段。

---

# 每日执行版

## 周一，下班后 1–1.5 小时

目标：定评测范围，别一上来写脚本。

今天做 3 件事：

### 1. 新建目录

```Shell
mkdir -p evals/reports evals/datasets scripts
```


### 2. 写 `evals/README.md`

内容只写这 4 段：

- 为什么要做 eval

- 这周评什么

- 每类怎么判断 pass/fail

- 这周先不评什么

### 3. 列样本类别

先定这 3 类：

- `extract`

- `docs`

- `task`

### 今天的完成标准

你已经明确“评测对象是什么”，而不是一上来写一堆模糊 case。

---

## 周二，下班后 1–1.5 小时

目标：写前 10 条样本。

今天只写 JSONL，不写脚本。

### 样本结构建议

每条样本至少有这些字段：

```JSON
{
  "id": "extract_001",
  "type": "extract",
  "input": "...",
  "must_include": ["首页原型", "竞品资料"],
  "must_not_include": ["数据库迁移"],
  "notes": "重点看行动项是否抽到"
}
```


### 今天写：

- 4 条 extract

- 4 条 docs

- 2 条 task

### 今天的完成标准

你已经有 `evals/datasets/dataset_v1.jsonl`，并且至少 10 条样本。

---

## 周三，下班后 1–1.5 小时

目标：把样本补到 20 条。

建议总量这样分：

- 8 条 extract

- 8 条 docs

- 4 条 task

### docs 类样本要刻意覆盖这 3 种情况

7. 文档中明确有答案

8. 文档里只有部分依据

9. 文档里没有答案

这是因为官方也强调，eval 的意义不只是测“答得对不对”，而是测“是否符合你定义的行为标准”。([OpenAI 平台](https://platform.openai.com/docs/guides/evals?lang=javascript&utm_source=chatgpt.com))

### 今天的完成标准

- 数据集到 20 条

- 每条样本你都能一句话解释“它在测什么”

---

## 周四，下班后 1.5–2 小时

目标：写最小评测脚本。

这周先不接 OpenAI Evals API，直接用本地 Node 脚本跑你的应用接口。

### 你要测的接口

- `POST /api/extract`

- `POST /api/ask-docs`

- `POST /api/agent-task`

### 新建文件

```Plain Text
scripts/run-evals.mjs
```


### 脚本逻辑

10. 读 `dataset_v1.jsonl`

11. 按 `type` 调对应接口

12. 拿结果

13. 用最简单规则打分：

  - `must_include` 是否命中

  - `must_not_include` 是否违规

  - docs 是否有 citations

  - task 是否 `createdTask != null`

14. 输出 `evals/reports/report_v1.md`

### 今天的完成标准

脚本能跑通，不要求漂亮。

---

## 周五，下班后 1 小时

目标：第一次跑完整数据集。

### 今天做

- 跑 `node scripts/run-evals.mjs`

- 生成第一版报告

- 找出失败最多的 3 条

### 今天的完成标准

你有一份可读的评测报告，而不是控制台一堆杂乱日志。

---

## 周六，4–6 小时

目标：修一轮，再跑一轮。

今天只做下面这条闭环：

15. 看失败样本

16. 判断失败原因：

  - prompt

  - schema

  - retrieval

  - tool description

17. 只改 1–2 个最明显问题

18. 再跑一次 eval

19. 对比前后结果

### 今天要刻意练的能力

OpenAI 官方一直强调 eval 的核心价值，是在你迭代 prompt / model / config 时，知道结果是否真的变好了。([OpenAI 平台](https://platform.openai.com/docs/guides/evals?lang=javascript&utm_source=chatgpt.com))

### 周六完成标准

你至少做出一次“改动前 vs 改动后”的对比。

---

## 周日，3–4 小时

目标：作品化。

今天做 4 件事：

### 1. 写 README 的 Week 5 章节

### 2. 录一个 1–2 分钟 Eval Demo

### 3. 写 3 条失败案例

### 4. 写一页“我如何判断问题出在 retrieval / prompt / tool”

### 周日完成标准

你可以把 Week 5 讲成一句职业化的话：

> 我开始为 AI Workspace Lite 建立最小评测护栏，能够用固定数据集回归测试结构化抽取、带引用问答和工具调用。

---

# 推荐目录结构

这周结束后，建议项目新增这些文件：

```Plain Text
evals/
├─ README.md
├─ datasets/
│  └─ dataset_v1.jsonl
└─ reports/
   ├─ report_v1.md
   └─ report_v2.md

scripts/
└─ run-evals.mjs
```


---

# 数据集模板

你直接照这个格式写。

## 1）extract 样本

```JSON
{"id":"extract_001","type":"extract","input":"本周项目例会决定，下周一前由小王完成首页原型，小李负责整理竞品资料。当前风险是需求方还没有确认会员规则。","must_include":["首页原型","竞品资料","会员规则"],"must_not_include":["数据库迁移"],"notes":"应抽到行动项和风险"}
```


## 2）docs 样本

```JSON
{"id":"docs_001","type":"docs","input":"当前版本支持哪些能力？","must_include":["Prompt Lab","Structured Extractor","Doc QA"],"must_not_include":["多工作区权限隔离"],"require_citation":true,"notes":"答案应来自 sample-docs"}
```


## 3）task 样本

```JSON
{"id":"task_001","type":"task","input":"根据这段结论，帮我创建一个跟进任务：确认 Week 4 整合页和最小工具调用闭环","expect_task":true,"notes":"应触发 create_task"}
```


---

# 最小评测脚本骨架

下面这份足够你 Week 5 开工。

## `scripts/run-evals.mjs`

```JavaScript
import fs from "fs";

const BASE_URL = "http://localhost:3000";

function loadJsonl(filePath) {
  return fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function includesAll(text, arr = []) {
  return arr.every((item) => text.includes(item));
}

function includesNone(text, arr = []) {
  return arr.every((item) => !text.includes(item));
}

async function callExtract(input) {
  const res = await fetch(`${BASE_URL}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input }),
  });
  return res.json();
}

async function callDocs(input) {
  const res = await fetch(`${BASE_URL}/api/ask-docs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: input }),
  });
  return res.json();
}

async function callTask(input) {
  const res = await fetch(`${BASE_URL}/api/agent-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input, source: "docs" }),
  });
  return res.json();
}

function gradeExtract(sample, output) {
  const text = JSON.stringify(output.result || {});
  return {
    pass:
      includesAll(text, sample.must_include) &&
      includesNone(text, sample.must_not_include),
    debug: text,
  };
}

function gradeDocs(sample, output) {
  const answer = output.answer || "";
  const hasCitation = Array.isArray(output.citations) && output.citations.length > 0;

  return {
    pass:
      includesAll(answer, sample.must_include) &&
      includesNone(answer, sample.must_not_include) &&
      (!sample.require_citation || hasCitation),
    debug: answer,
  };
}

function gradeTask(sample, output) {
  const created = !!output.createdTask;
  return {
    pass: sample.expect_task ? created : !created,
    debug: JSON.stringify(output.createdTask || null),
  };
}

async function main() {
  const dataset = loadJsonl("evals/datasets/dataset_v1.jsonl");
  const results = [];

  for (const sample of dataset) {
    let output;
    let graded;

    if (sample.type === "extract") {
      output = await callExtract(sample.input);
      graded = gradeExtract(sample, output);
    } else if (sample.type === "docs") {
      output = await callDocs(sample.input);
      graded = gradeDocs(sample, output);
    } else if (sample.type === "task") {
      output = await callTask(sample.input);
      graded = gradeTask(sample, output);
    } else {
      graded = { pass: false, debug: "未知样本类型" };
    }

    results.push({
      id: sample.id,
      type: sample.type,
      pass: graded.pass,
      debug: graded.debug,
      notes: sample.notes || "",
    });
  }

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;

  let report = `# Eval Report\n\n`;
  report += `- total: ${total}\n`;
  report += `- passed: ${passed}\n`;
  report += `- pass_rate: ${((passed / total) * 100).toFixed(1)}%\n\n`;
  report += `## Cases\n\n`;

  for (const r of results) {
    report += `### ${r.id} [${r.type}] - ${r.pass ? "PASS" : "FAIL"}\n`;
    report += `- notes: ${r.notes}\n`;
    report += `- debug: ${r.debug}\n\n`;
  }

  fs.writeFileSync("evals/reports/report_v1.md", report);
  console.log("Done. Report written to evals/reports/report_v1.md");
}

main().catch(console.error);
```


---

# Week 5 README 增量模板

把这段加到 `README.md`：

```Plain Text
## Week 5 - Eval Harness v1

### 本周目标
为 AI Workspace Lite Alpha 建立最小评测护栏，避免每次改 prompt、schema 或工具描述时只能靠感觉判断效果。

### 覆盖范围
- Structured Extractor
- Doc QA
- Agent Task

### 当前评测方式
- 本地 JSONL 数据集
- 本地批量运行脚本
- 规则型 grader
- Markdown 报告输出

### 为什么重要
评测的意义不是追求一套很复杂的分数系统，而是建立“改动 -> 回归 -> 对比”的工程习惯。

### 本周复盘
#### 哪类问题失败最多
- 

#### 我判断是 retrieval / prompt / tool 哪一层的问题
- 

#### 下周准备如何修
- 
```


---

# Week 5 Demo 脚本

周日录视频就按这个顺序：

20. 打开 `dataset_v1.jsonl`，说明你定义了固定测试集

21. 运行 `node scripts/run-evals.mjs`

22. 打开生成的 `report_v1.md`

23. 指出 2 个通过样本、1 个失败样本

24. 说明失败原因是：

  - prompt 不够明确
或

  - retrieval 没取到
或

  - tool description 太弱

25. 最后总结：从这周开始，你改系统不再靠感觉

---

# 这周最容易踩的 3 个坑

第一，**样本写得太泛**。
如果 `must_include` 太抽象，你的 grader 会很虚。尽量写成明确词项。

第二，**把所有失败都归因给模型**。
官方对 agent evals 的建议里就强调，工作流级错误需要更细粒度定位，trace grading 就是为这个准备的。你当前先手动做这件事。([OpenAI 平台](https://platform.openai.com/docs/guides/agent-evals?utm_source=chatgpt.com))

第三，**一开始就追求复杂 grader**。
官方 graders 文档明确建议从小开始、逐步迭代。你现在最适合的是规则型 grader。([OpenAI 平台](https://platform.openai.com/docs/guides/graders/?utm_source=chatgpt.com))

---

# 你这周真正学到的，不是“会写一个脚本”

而是这套思维：

- 先定义预期行为

- 再跑固定输入

- 再看结果

- 再判断问题层级

- 再改

- 再回归

这一步对 AI 应用工程师非常关键。

下一条我可以直接给你 **Week 6 的执行版**。

