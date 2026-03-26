import type { ExtractionResult } from "@/schemas/extraction";

const severityLabel: Record<string, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

/** 将抽取结果转为 Markdown，便于导出或粘贴到文档。 */
export function extractionToMarkdown(data: ExtractionResult): string {
  let md = `## 简要总结\n\n${data.summary}\n\n## 行动项\n\n`;

  if (data.actionItems.length === 0) {
    md += `_未发现明确行动项_\n\n`;
  } else {
    for (const item of data.actionItems) {
      md += `- **任务：** ${item.task}\n`;
      md += `  - 负责人：${item.owner ?? "未明确"}\n`;
      md += `  - 截止时间：${item.dueDate ?? "未明确"}\n\n`;
    }
  }

  md += `## 风险\n\n`;
  if (data.risks.length === 0) {
    md += `_未发现明显风险_\n\n`;
  } else {
    for (const risk of data.risks) {
      const sev = severityLabel[risk.severity] ?? risk.severity;
      md += `- **${risk.title}**（等级：${sev}）\n`;
      md += `  - 原因：${risk.reason}\n\n`;
    }
  }

  md += `## 待确认问题\n\n`;
  if (data.openQuestions.length === 0) {
    md += `_暂无待确认问题_\n`;
  } else {
    for (const q of data.openQuestions) {
      md += `- ${q}\n`;
    }
  }

  return md.trimEnd() + "\n";
}
