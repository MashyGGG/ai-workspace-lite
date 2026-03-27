import type { ChatCompletionTool } from "openai/resources/chat/completions";

/** Kimi / OpenAI Chat Completions `tools[]` 形态（非 Responses API 扁平形态） */
export const createTaskTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "create_task",
    description:
      "为当前结论或后续动作创建一个待办任务。当用户提到跟进、保存、待办、创建任务时优先调用。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string",
          description: "任务标题，应简洁明确，可直接执行",
        },
        source: {
          type: "string",
          enum: ["extract", "docs"],
          description: "任务来源页面",
        },
      },
      required: ["title", "source"],
    },
  },
};
