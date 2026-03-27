# Week 08 实现复盘（结合本仓库）

本文档对照同目录 [week-08/README.md](./README.md) 的 **Portfolio / Beta 封装周**，说明本仓库 **实际交付、与课程差异、可优化点**。

---

## 1. 课程目标与完成标准

Week 8 要求不新增大块功能，而将 Alpha 封装为**可投递、可演示、可解释**的版本：根 README、架构图、评测摘要、成本/延迟、失败复盘、Demo 脚本、简历描述等。验收见课程 README 中 8 条清单。

---

## 2. 本仓库实际实现

| 能力 | 路径 | 说明 |
|------|------|------|
| 作品集式根 README | [README.md](../../README.md) | What / Why / Features / System / Eval / Safety / Ops / Failures / Roadmap + 快速开始 + Week 01–08 链接 |
| 能力盘点 | [docs/week8-inventory.md](../week8-inventory.md) | 页面、API、能力、不稳定点、本周不做 |
| 架构与数据流 | [docs/architecture-overview.md](../architecture-overview.md) | Mermaid：组件图 + Extract / Docs / Task 三流 |
| 评测摘要 | [docs/benchmark-summary.md](../benchmark-summary.md) | 主 eval、安全 eval、Ops、优化对比叙事 + 复现命令 |
| 失败复盘 | [docs/postmortems/](../postmortems/) | retrieval-miss、tool-not-called、approval-boundary |
| Demo / 求职 | [docs/demo-script.md](../demo-script.md)、[docs/resume-and-interview.md](../resume-and-interview.md) | 3–5 分钟脚本；英/中简历与面试摘要 |
| 首页露出 | [src/app/page.tsx](../../src/app/page.tsx) | 增加 Workspace、Ops 卡片；标题改为 Beta |
| 文档索引 | [docs/README.md](../README.md) | 补齐 Week 04–08 与复盘链接 |

---

## 3. 与课程文档的差异

- 课程示例目录含 `assets/*.png`：本仓库以 **Mermaid 源码**为主，便于 Git 维护；需要幻灯片时可本地导出 PNG 到 `assets/`。  
- 课程 Demo 脚本中 `security_cases_v1.jsonl` 曾写于仓库根路径：实际位置为 **`evals/datasets/security_cases_v1.jsonl`**。  
- 主评测报告 `report_v1.md` 默认**运行 eval 后生成**，未必提交入库；摘要写在 `benchmark-summary.md` 并说明复现。  
- 安全预检不使用 OpenAI API：见 [domestic-llm.md](../domestic-llm.md)。

---

## 4. 可优化点

- 提交一次 **baseline** `report_v1.md` 快照，方便克隆者零运行阅读（与报告过期之间需权衡）。  
- `assets/architecture-diagram.png` 与 Mermaid 双源时，建立更新 checklist 避免漂移。  
- 将 `benchmark-summary.md` 中的「优化前后」表格填上真实两次 eval 数字（需本地跑数）。

---

## 5. 后续方向

回到各周课程主线：向量检索、CI eval、服务端日志、定价配置化等；Week 8 仅完成「表达层」封装，不改变产品能力边界。

---

## 相关链接

- 课程原文：[week-08/README.md](./README.md)  
- 根目录：[README.md](../../README.md)
