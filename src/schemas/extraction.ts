import { z } from "zod";

export const ActionItemSchema = z.object({
  task: z.string().describe("明确可执行的任务"),
  owner: z.string().optional().describe("负责人，如果原文未提及可省略"),
  dueDate: z.string().optional().describe("截止时间，如果原文未提及可省略"),
});

export const RiskSchema = z.object({
  title: z.string().describe("风险标题"),
  reason: z.string().describe("为什么这是一个风险"),
  severity: z.enum(["low", "medium", "high"]).describe("风险等级"),
});

export const ExtractionSchema = z.object({
  summary: z.string().describe("对原文的简洁总结"),
  actionItems: z.array(ActionItemSchema).describe("从原文中提取的行动项"),
  risks: z.array(RiskSchema).describe("从原文中识别的风险"),
  openQuestions: z.array(z.string()).describe("仍需澄清的问题"),
});

export type ExtractionResult = z.infer<typeof ExtractionSchema>;
