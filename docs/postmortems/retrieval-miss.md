# Failure Postmortem：检索未命中 / 空依据

## Incident

用户在 `/docs` 提问，模型返回「未在文档中找到足够依据」，但用户认为仓库里「明明有相关文档」；或 `searchResults` 为空 / 明显漏检，导致体验像「RAG 坏了」。

## Reproduction

1. 执行 `node scripts/setup-doc-index.mjs` 后，确认索引中包含预期文件。  
2. 在 `/docs` 用**同义词、缩写或跨段落**的问题提问（例如文档只写全称，用户用简称）。  
3. 观察 `answer` 与 `citations` / `searchResults` 是否为空或偏弱。

## Root Cause

- **检索层**：当前实现为将文档内容载入 **system 上下文**，依赖模型在长上下文内自行定位，**无独立向量检索重排**；窗口或分块策略不当时，相关片段可能未出现在有效上下文中。  
- **Prompt / 输出层**：JSON schema 要求 `citations` 与文档严格对应，模型偏保守时会选择空引用。  
- **数据层**：索引未更新、文件未纳入索引、或文件名与预期不符。

## Fix

- 运行或重新运行索引脚本，确认文档集一致。  
- 在 [ask-docs route](../../src/app/api/ask-docs/route.ts) 的 system 中强化「同义扩展仍须在文档内有字面或强语义支撑」的边界（避免编造的同时，可要求 `searchResults` 列出低相关片段供人工判断）。  
- 对用户侧：改问更贴近原文的用语，或拆成更短问题。

## Regression

- 保留 `docs` 类 eval 样本（如 `dataset_v1.jsonl` 中无依据 / 部分依据 case），每次 `npm run eval` 回归。  
- 在 Ops 中对比长问题的 latency 与 token，识别「上下文过长」类问题。
