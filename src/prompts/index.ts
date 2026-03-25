import { summarizePrompt } from "./summarize";
import { actionItemsPrompt } from "./action-items";
import { riskReviewPrompt } from "./risk-review";
import type { PromptTask } from "@/types/prompt-task";

export function buildPrompt(task: PromptTask, text: string): string {
  switch (task) {
    case "summarize":
      return summarizePrompt(text);
    case "action_items":
      return actionItemsPrompt(text);
    case "risk_review":
      return riskReviewPrompt(text);
    default:
      return summarizePrompt(text);
  }
}

