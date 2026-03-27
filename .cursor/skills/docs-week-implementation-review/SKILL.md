---
name: docs-week-implementation-review
description: >-
  After implementing requirements from docs/week-XX/README.md, writes or updates
  docs/week-XX/IMPLEMENTATION_REVIEW.md and adds two README links in the repo
  root README.md. Use when finishing a weekly docs-driven feature, when the user
  mentions week folders under docs/, IMPLEMENTATION_REVIEW, or weekly course
  implementation handoff.
---

# 每周文档实现后的复盘与根 README 登记

## 何时启用

只要本次工作**依据** `docs/week-XX/README.md`（或同级周目录下的课程 README）**完成实现**，在收尾阶段必须执行本流程，除非用户明确只要代码、不要文档。

## 必须完成的两件事

### 1. 撰写或更新 `IMPLEMENTATION_REVIEW.md`

- **路径**：`docs/week-XX/IMPLEMENTATION_REVIEW.md`（`XX` 为两位周序号，与对应 README 同目录）。
- **若已存在**：在保留原有结构风格的前提下，按本次改动**增量更新**（新增小节、表格行或修订段落），避免整篇重写丢历史。
- **若不存在**：新建文件，结构与仓库内已有周次保持一致，例如参照 [docs/week-01/IMPLEMENTATION_REVIEW.md](../../../docs/week-01/IMPLEMENTATION_REVIEW.md)：
  - 标题：`# Week XX 实现复盘（结合本仓库）`
  - 开篇一段：对照同目录 [`./README.md`](./README.md) 说明本文用途。
  - 正文建议包含：**课程目标与完成标准**、**本仓库实际实现**（表格：能力 / 路径 / 说明）、**与课程文档的差异**、**可优化点**、**下一周或后续方向**（按当周内容取舍）。
- 文内链接周 README 时使用相对路径 `./README.md`。

### 2. 在根目录 `README.md` 登记两条路径

- **文件**：仓库根目录 [README.md](../../../README.md)。
- **格式**：与现有 Week 01–03 区块**完全一致**（标点、空格、列表符号与链接形式勿自创变体）：

```markdown
## Week XX - <本周标题，与 docs/week-XX/README.md 或用户约定一致>

- 对应完整文档：[docs/week-XX/README.md](docs/week-XX/README.md)

- 对应复盘文档: [docs/week-XX/IMPLEMENTATION_REVIEW.md](docs/week-XX/IMPLEMENTATION_REVIEW.md)
```

- 在 `## Week …` 各节中按**周序号升序**插入新周区块；若该周区块已存在，只检查两条链接是否仍正确、标题是否需微调。
- **不要**删除或改写「快速开始」「环境变量」等无关章节；仅追加或修正周区块。

## 自检清单

- [ ] `docs/week-XX/IMPLEMENTATION_REVIEW.md` 已反映**本次**实现与课程 README 的对照。
- [ ] 根 `README.md` 中该周有两行链接，且与上方面板**逐字格式**一致。
- [ ] 新周目录若首次出现，周 README 与复盘路径在根 README 中均已登记。
