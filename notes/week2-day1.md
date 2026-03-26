# Week 2 — Day 1 笔记

1. **结构化输出**指模型按约定 schema（如 JSON 对象）返回数据，而不是自由格式的自然语言段落。
2. 它比自由文本更适合业务系统，因为下游可以直接解析、校验、存库和渲染，减少「再解析一遍」的脆弱逻辑。
3. 从 Week 2 就开始用 schema，是为了尽早把「业务对象长什么样」说清楚，让 prompt 主要描述语义而非格式。
4. Structured Outputs 的目标是提高对 schema 的遵守率，并支持可检测的拒答等能力，而不是只靠提示词「请输出 JSON」。
5. 在 Kimi（Moonshot）上可用 Chat 的 `json_object` 模式配合提示词约束 JSON 形状，再用 Zod 做 `safeParse`，得到类型一致、可校验的业务对象（与 OpenAI `responses.parse` 的实现路径不同，但工程目标相同）。
