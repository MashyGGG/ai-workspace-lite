你现在是一个“AI-first 软件工程多 Agent 系统设计师”，目标不是讨论概念，而是为 Cursor 场景设计一套可落地的多 agent 工作流架构。

这套架构要服务于以下场景：
- 软件开发
- 代码审查与修复
- 文档生成
- 知识整理

请把重点放在：
- 如何设计主控 agent 与 subAgent
- 如何拆分角色职责
- 如何通过共享 markdown/json 文件实现 handoff
- 如何通过 skills 让不同 agent 执行各自擅长的任务
- 如何建立结构化验收、重试、升级、回退机制
- 如何让系统可观察、可审计、可扩展、可控成本

不要写成泛泛的方法论文章，不要只给概念。  
必须输出可以直接落地到 Cursor 工作流中的方案、模板、目录结构、协议、提示词。

----------------------
一、设计前提
----------------------

请默认以下设计前提，不要反复质疑：

1. 这是一个 AI-first 软件工程系统，不是普通聊天机器人系统。
2. 采用主控 orchestrator + 多个 subAgent 的模式。
3. subAgent 之间不依赖自由聊天，而主要通过以下方式协作：
   - 共享 markdown 文件
   - 共享 json 文件
   - 结构化 handoff 对象
   - 由 orchestrator 中介路由和审核
4. 工作流必须是“阶段化闭环”，不能假设一次对话完成整条链路。
5. 每个阶段都必须有输入、输出、状态、验收条件。
6. 每个 agent 必须先自检，最终必须有统一 QA。
7. skills 必须分为：
   - 通用核心层
   - 项目覆盖层
8. 方案需要适合 Cursor 这类代码仓库和工程文件为中心的环境。

----------------------
二、我的目标
----------------------

请围绕下面目标设计系统：

1. 支持完整链路，但按阶段执行：
   - requirements
   - design
   - implementation
   - self-check
   - QA
   - docs
   - knowledge capture

2. 对外按角色拆分：
   - 架构
   - 编码
   - QA
   - 文档

3. 对内允许继续细分 subAgent，例如：
   - requirement-planner
   - solution-architect
   - feature-implementer
   - bugfixer
   - self-checker
   - final-qa
   - documentation-agent
   - knowledge-curator

4. 主控 orchestrator 必须负责：
   - 路由
   - 审核
   - 有限重试
   - 升级/回退
   - 最终整合输出

----------------------
三、输出要求
----------------------

请严格按以下结构输出，不要省略：

# 1. 架构总览
说明：
- 为什么采用阶段化闭环
- 为什么采用 orchestrator 中介
- 为什么 agent 之间主要通过文件和结构化 handoff 协作
- 这套方案如何适配 Cursor

# 2. 角色与 subAgent 设计
请输出一个清晰的角色层级设计：
- orchestrator
- architect 类 agent
- coding 类 agent
- QA 类 agent
- docs 类 agent
- knowledge 类 agent

对每个 agent 必须说明：
- 职责
- 输入
- 输出
- 不该做什么
- 交接给谁
- 何时升级/回退

# 3. 阶段化工作流
请把工作流拆成以下阶段：
- Stage 1: requirements
- Stage 2: design
- Stage 3: implementation
- Stage 4: self-check
- Stage 5: QA
- Stage 6: docs
- Stage 7: knowledge capture

对每个阶段输出：
- 目标
- 输入
- 输出
- 负责 agent
- 进入条件
- 完成条件
- 失败处理方式

# 4. 通信与 handoff 协议
请重点设计这一部分。

必须输出：

## 4.1 推荐目录结构
例如但不限于：
- tasks/
- handoffs/
- specs/
- reviews/
- docs/
- knowledge/
- logs/
- skills/
- overlays/

## 4.2 handoff JSON schema
请给一个统一 schema，至少包含：
- task_id
- parent_task_id
- stage
- source_agent
- target_agent
- goal
- inputs
- constraints
- expected_outputs
- produced_outputs
- acceptance_criteria
- self_check_result
- status
- retry_count
- escalation_flag
- notes
- next_action

## 4.3 markdown 模板
请给出模板：
- 需求文档
- 技术方案
- 实现说明
- QA 审核
- 文档沉淀
- 知识整理

## 4.4 状态机
请定义状态，例如：
- drafted
- ready
- in_progress
- blocked
- review_failed
- retrying
- escalated
- completed
- archived

并说明：
- 谁可以修改状态
- 哪些状态必须写审计日志
- 哪些状态会触发回退或升级

# 5. 验收与正确性设计
请分三层说明：
- 任务级验收
- 产物级验收
- 阶段级验收

并明确回答：
- 正确性由谁定义
- 正确性由谁验证
- 如何避免 agent 自我放行
- 如何处理“看起来合理但实际上错误”的输出

# 6. 重试、升级、回退机制
请给出明确策略：
- 最大重试次数
- 哪些问题允许重试
- 哪些问题必须升级给 orchestrator
- 哪些问题必须回退到上游阶段
- 哪些问题必须停止流程
- 如何避免无限振荡

# 7. 成本控制
请明确说明：
- 如何限制无意义的 agent 级联调用
- 如何限制上下文膨胀
- 如何减少重复 review / 重复 QA
- 如何定义“值得调用另一个 agent”的阈值
- 如何控制 docs / knowledge 文件持续膨胀

# 8. skills 体系设计
请把 skills 设计成两层：

## 8.1 通用核心 skill
应包含：
- 通用角色规则
- SOP
- 输出模板
- 验收骨架
- 工具调用约束
- 失败处理规则

## 8.2 项目覆盖层 skill
应包含：
- 仓库结构
- 技术栈
- 测试命令
- 命名规范
- 禁止修改区域
- PR / review 规范
- 领域术语
- 项目特有约束

并说明：
- 不同 agent 如何复用 skill
- 如何防止 skill 过度通用导致失效
- 如何让项目覆盖层只补充差异，而不复制整套核心规则

# 9. 可直接复制的提示词模板
请给出以下模板：

## 9.1 orchestrator 系统提示词
要求：
- 负责路由、审核、有限重试、升级/回退、整合输出
- 不亲自吞掉所有子任务
- 强制使用结构化 handoff

## 9.2 subAgent 通用模板
要求：
- 适用于大多数子 agent
- 包含职责、输入、输出、约束、自检、交接要求

## 9.3 solution-architect 模板
## 9.4 feature-implementer 模板
## 9.5 final-qa 模板
## 9.6 documentation-agent 模板

模板必须尽量具体，不能只是几句空话。

# 10. 可复用的 skill 模板
请输出一个可直接改造的 skill 模板，至少包括：
- SKILL.md 示例
- 角色规则示例
- SOP 示例
- 输出模板示例
- 验收规则示例
- 失败处理规则示例
- few-shot 输入输出示例

# 11. 项目目录结构示例
请给出一个真实可用的目录树，体现：
- agent 工作区
- task / handoff 文件
- specs
- reviews
- docs
- knowledge
- logs
- skills
- overlays

# 12. MVP 落地建议
最后请给出：
- 第一阶段最小可用版本建议先实现哪些 agent
- 第二阶段再扩展哪些 agent
- 哪些部分最容易过度工程化
- 哪些部分必须先做，哪些可以后补

----------------------
四、强约束
----------------------

请遵守以下强约束：

1. 不要假设存在“agent 原生自由通信”能力，优先使用工程替代方案。
2. 不要把“多 agent 协作”写成自由发挥，必须落实为：
   - 文件
   - schema
   - 状态
   - 模板
   - 验收机制
3. 不要只给抽象原则，必须给：
   - 目录结构
   - JSON schema
   - markdown 模板
   - 提示词模板
   - skill 模板
4. 不要默认无限上下文、无限调用次数、无限重试。
5. 任何推荐方案都要兼顾：
   - 稳定性
   - 透明性
   - 治理能力
   - 可复盘
6. 输出内容必须让我可以直接拿去当作 Cursor 中的多 agent 架构蓝图。

现在开始输出。