# 国内大模型与「无 OpenAI API」说明

本仓库**不要求**配置或调用 **OpenAI 官方 API**（无需 `OPENAI_API_KEY`）。所有对话与安全相关的大模型调用均走 **Kimi（Moonshot）** 兼容 **Chat Completions** 的 endpoint。

---

## 1. 为什么仓库里还有 `openai` npm 包？

Moonshot 提供与 OpenAI **兼容的 HTTP 形态**（路径、请求体与 Chat Completions 类似），因此使用官方维护的 [`openai` Node SDK](https://www.npmjs.com/package/openai) 作为 **HTTP 客户端**，并把 `baseURL` 设为 `MOONSHOT_BASE_URL`。  
**流量不会发往 `api.openai.com`**，除非你自行把 `MOONSHOT_BASE_URL` 改成 OpenAI 地址。

导出名称使用 **`moonshot`**（见 [`src/lib/llm.ts`](../src/lib/llm.ts)），避免与「OpenAI 供应商」混淆。

---

## 2. 输入安全预检如何实现？

[`src/lib/safety.ts`](../src/lib/safety.ts) 两层：

1. **规则层** `isSuspiciousPrompt`：本地关键词/短语，零额外请求。  
2. **模型层** `moderateText`：使用 **同一 `MOONSHOT_API_KEY`**，调用 Kimi，要求只返回 `{"flagged": boolean}` 的 JSON，用于补充规则未覆盖的越狱、套取密钥等模式。

与原先 OpenAI `moderations.create` 的差异：

| 维度 | 原 OpenAI Moderation | 当前 Kimi JSON 分类 |
|------|----------------------|---------------------|
| 服务位置 | OpenAI 境外 | Moonshot（国内可访问） |
| 稳定性 | 专用分类模型 | 依赖对话模型遵循 JSON 指令，可能有边界误报/漏报 |
| 成本 | 官方说明 moderation 免费 | 计入与普通 Chat 相同的计费 |
| 失败策略 | 出错时返回 null，不阻断（fail-open） | 相同 |

未配置 `MOONSHOT_API_KEY` 时，`moderateText` 直接返回 `null`，仅规则层生效。

可选环境变量 **`MOONSHOT_SAFETY_MODEL`**：指定用于安全分类的模型名；不填则与 **`MOONSHOT_MODEL`** 相同。若希望主任务用大模型、分类用小模型，可在此单独指定（以 Moonshot 控制台可用模型为准）。

---

## 3. 迁移说明（若你曾使用 OPENAI_API_KEY）

请从 `.env.local` 中**删除** `OPENAI_API_KEY`。安全第二层已改为 Kimi，无需替换为其他境外 key。

---

## 4. 若希望完全去掉 `openai` npm 依赖

需要自行用 `fetch` 实现 Chat Completions 请求体与流式/非流式解析，维护成本更高；当前方案是业界对接「OpenAI 兼容网关」的常见做法。
