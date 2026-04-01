你是一名“AI-first 多 Agent 软件工程架构师”。你的任务不是给概念介绍，而是为我设计一套可落地的多 agent 工作流系统，用于软件开发主链路，并外挂支持代码审查与修复、文档生成与知识整理。

请严格按照下面的要求输出，不要省略，不要用空泛建议代替具体方案。

====================
一、设计目标
====================

请为我设计一套“可阶段化落地”的多 agent 架构，满足以下目标：

1. 场景范围
- 软件开发主链路
- 代码审查与修复
- 文档生成
- 知识整理

2. 工作范围
系统必须支持完整链路，但必须按阶段切分，而不是一次性长链路执行：
- 需求整理
- 技术方案
- 编码实现
- 自检
- QA 验证
- 文档沉淀

3. 架构原则
- 可观察
- 可审计
- 可扩展
- 可控成本

4. 控制模式
主控 agent 必须具备：
- 路由
- 审核
- 有限重试
- 升级/回退
- 最终整合输出

5. 通信方式
不同 agent 之间不能依赖松散自然语言对话作为主要机制，而应采用：
- 共享 markdown 文件
- 共享 json 文件
- 结构化 handoff 对象
- 主控 agent 中介转发

6. 质量策略
- 每个 agent 必须先自检
- 自检应尽量基于 checklist、schema、测试、lint、validator 等机制
- 最后必须有统一 QA 验收

7. 技能体系
skills 不能只是提示词集合，而要包含：
- 提示词规则
- SOP 工作步骤
- 输出模板
- 验收规则
- 工具调用说明
- 失败处理规则
- 示例输入输出

8. 复用策略
技能体系不能只做纯通用抽象，而应采用：
- 通用核心层
- 项目覆盖层

====================
二、回答规则
====================

你必须遵守以下规则：

1. 不要只讲理念，必须提供工程可执行设计。
2. 任何“角色”“agent”“skill”“handoff”“QA”都必须有明确输入、输出、状态、验收说明。
3. 必须把“协议层”单独设计出来，而不是把它混在提示词里。
4. 必须显式设计失败处理机制，包括：
- 哪些错误允许重试
- 最大重试次数
- 哪些错误需要升级
- 哪些错误需要回退到上游阶段
- 哪些错误必须停止流程
5. 必须把成本控制纳入架构，而不是默认无限调用 agent。
6. 必须强调阶段化交付，不允许把全链路当成一轮对话一次跑完。
7. 不要假设任何不存在的原生多 agent 直连能力；如果平台没有原生支持，优先提供工程替代方案。
8. 输出必须尽量使用 markdown、yaml、json、目录树、表格、伪代码等结构化形式。
9. 输出必须面向真实项目，而不是写成产品宣传或方法论文章。
10. 所有模板必须可复制、可改造、可直接用于项目初始化。

====================
三、必须输出的内容
====================

请按以下顺序输出，且每一部分都要完整：

# 1. 架构总览
请先给出：
- 系统目标
- 核心设计原则
- 为什么采用“阶段化闭环”而不是“一次性全链路”
- 为什么采用“主控中介 + 结构化 handoff”而不是 agent 自由对话

# 2. 多 agent 架构图
请给出：
- 主控 agent
- 架构类 agent
- 编码类 agent
- QA 类 agent
- 文档类 agent
- 知识整理类 agent

要求：
- 对外按角色分层展示
- 对内允许继续细分 subAgent
- 给出层级结构图
- 给出每个 agent 的职责边界
- 给出每个 agent 不该做什么

# 3. 阶段化工作流设计
请把全链路拆成独立阶段：
- Stage 1: requirements
- Stage 2: design
- Stage 3: implementation
- Stage 4: self-check
- Stage 5: QA
- Stage 6: docs
- Stage 7: knowledge capture（如适合）

对每个阶段说明：
- 目标
- 输入
- 输出
- 负责 agent
- 进入条件
- 完成条件
- 失败后的处理方式

# 4. agent 角色设计
请为每个核心 agent 输出下列内容：
- agent 名称
- 核心职责
- 输入契约
- 输出契约
- 允许使用的工具
- 禁止行为
- 自检 checklist
- 交接给谁
- 何时必须升级/回退

至少覆盖以下角色：
- orchestrator
- requirement-planner
- solution-architect
- feature-implementer
- bugfixer
- self-checker
- final-qa
- documentation-agent
- knowledge-curator

# 5. 通信与协议层设计
这是重点。

请单独设计协议层，不要把它散落到别处。必须包含：

5.1 文件体系
请给出推荐目录结构，例如：
- tasks/
- handoffs/
- specs/
- reviews/
- docs/
- knowledge/
- logs/

5.2 handoff JSON schema
请设计一个统一的 handoff schema，至少包含：
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

5.3 markdown 配套模板
请给出：
- 需求文档模板
- 方案设计模板
- 实现说明模板
- QA 审核模板
- 文档沉淀模板

5.4 状态机设计
请给出任务状态流转，例如：
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
- 哪些状态之间允许转移
- 谁能改状态
- 哪些状态必须写审计日志

# 6. 验收与正确性设计
请单独说明“correctness”如何定义，不要泛泛而谈。

必须分三层说明：
- 任务级验收
- 产物级验收
- 阶段级验收

并回答：
- 正确性由谁定义
- 正确性由谁验证
- 如何避免 agent 自己给自己放行
- 如何处理“看起来合理但实际上错误”的输出

# 7. 重试、升级、回退机制
请给出一套可执行策略：

7.1 重试机制
- 最大重试次数
- 哪类问题允许重试
- 重试时可以修改哪些上下文
- 如何避免无限振荡

7.2 升级机制
- 何时从子 agent 升级给 orchestrator
- 何时必须升级给人工
- 升级时必须附带哪些信息

7.3 回退机制
- 哪些错误应该退回上一个阶段
- 哪些错误应该直接终止
- 哪些错误可以降级交付

# 8. 成本控制设计
请明确回答：
- 如何限制无意义 agent 级联调用
- 如何限制上下文无限膨胀
- 如何减少重复 review / 重复 QA
- 如何控制文档和知识沉淀的体积
- 如何定义“值得调用另一个 agent”的阈值

# 9. skills 体系设计
请把 skills 分成两层：

9.1 通用核心 skill
说明应该包含什么，适合哪些 agent 共享。

9.2 项目覆盖层 skill
说明应该放哪些项目特有内容，例如：
- 仓库结构
- 技术栈
- 测试命令
- 命名规范
- 领域术语
- 禁止修改区域
- PR / review 规范

然后请给出：
- skill 目录结构
- skill 文件划分建议
- 每个 skill 的最小内容清单
- skill 如何被不同 agent 复用
- 如何防止 skill 过于通用而失效

# 10. 提示词模板
请给出可直接复制的提示词模板：

10.1 orchestrator 系统提示词
要求：
- 负责路由、审核、重试、升级、整合
- 不亲自吞掉所有子任务
- 只在必要时改派或回退
- 强制要求结构化 handoff

10.2 subAgent 通用模板
要求：
- 适用于大多数子 agent
- 包含职责、输入、输出、约束、自检、交接要求

10.3 feature-implementer 提示词
10.4 final-qa 提示词
10.5 documentation-agent 提示词

每个模板都要尽量具体，不要写成空泛口号。

# 11. skill 模板
请输出一个可复用的 skill 模板，至少包括：
- SKILL.md 示例
- prompt rules 示例
- SOP 示例
- 输出模板示例
- 验收规则示例
- 失败处理规则示例
- few-shot 输入输出示例

# 12. 项目目录结构示例
请给出一个真实可用的项目目录树，能体现：
- agent 工作区
- handoff 文件
- specs
- review
- docs
- knowledge
- logs
- skills
- project overlays

# 13. 最终落地建议
最后请给出：
- 第一阶段最小可用版本（MVP）应只实现哪些 agent
- 第二阶段再扩展哪些角色
- 哪些设计最容易过度工程化
- 哪些部分必须先做，哪些可以以后再补

====================
四、特别要求
====================

1. 所有设计必须围绕“AI-first 软件工程工作流”，不是泛用聊天机器人系统。
2. 你的重点不是证明多 agent 很厉害，而是设计一个：
- 稳定
- 透明
- 可治理
- 可复盘
- 能逐步演进

的系统。
3. 任何地方都不要依赖“agent 自由发挥协作”这种模糊说法，必须转化为协议、模板、状态、文件、验收机制。
4. 对于任何你认为存在权衡的地方，必须同时给出：
- 推荐方案
- 替代方案
- 适用条件
- 风险
5. 最终输出必须让我可以直接拿去当“多 agent 架构设计蓝图”。

补充上下文：
- 我的主要使用环境是 Cursor
- 希望优先适配代码仓库协作场景
- 希望 handoff 尽量基于 markdown + json 文件
- 希望第一版先落地在 4 个角色：orchestrator / architect / implementer / final-qa

现在开始输出。