# Week 7 Ops 复盘（周日填写）

## 我现在终于能看见什么

- 在 [/ops](http://localhost:3000/ops) 查看最近请求：**route、model、token、延迟、估算成本、是否触发 function 工具**。
- 三个 API（`/api/extract`、`/api/ask-docs`、`/api/agent-task`）成功响应中的 **`metrics`** 字段与页面写入的日志一致。

（在此补充你本地跑出来的 1–2 条具体观察，例如：docs 因 system 很长所以 input tokens 最大、task 触发工具时 latency 明显上升等。）

## 我还看不见什么

- **安全预检（Moderation）**单独耗时未拆分进 `metrics.latencyMs`（当前 latency 主要为 **Kimi Chat Completions** 调用区间；`agent-task` 为两轮合计墙钟时间）。
- **多设备 / 多浏览器**不共享 localStorage；清空站点数据会丢失历史 ops 记录。
- **真实账单**与估算成本可能不一致（汇率、活动价、缓存计费等）。

## 下周如果继续做，我最想补哪一层

- （示例）服务端持久化或导出 CSV；按 route 的默认模型策略；Eval 脚本解析 `metrics` 自动汇总。

---

## 课程要求的 3 条观察结论（实验后填写）

### 最慢的 route 是谁，为什么

- 

### 最贵的 route 是谁，为什么

- 

### 哪个 route 后面最值得继续优化

- 

## 模型对比实验结论（可选）

- **继续用当前默认模型（如 `kimi-k2.5`）的场景：**
- **值得尝试更小/更便宜模型的场景：**

> 实验方法：切换 `.env.local` 中的 `MOONSHOT_MODEL`，分别对 extract / docs / task 各跑若干次，对比 `/ops` 中的延迟与估算成本。
