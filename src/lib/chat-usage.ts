/**
 * Moonshot / OpenAI Chat Completions usage shape (SDK versions may vary).
 */
export type ChatCompletionUsageLike = {
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
  prompt_tokens_details?: { cached_tokens?: number | null } | null;
};

export type NormalizedUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens: number;
};

export function normalizeChatUsage(
  usage: ChatCompletionUsageLike | null | undefined,
): NormalizedUsage {
  const u = usage ?? {};
  const inputTokens = Number(u.prompt_tokens ?? 0) || 0;
  const outputTokens = Number(u.completion_tokens ?? 0) || 0;
  const totalFromApi = Number(u.total_tokens ?? 0) || 0;
  const totalTokens =
    totalFromApi > 0 ? totalFromApi : inputTokens + outputTokens;
  const cachedTokens =
    Number(u.prompt_tokens_details?.cached_tokens ?? 0) || 0;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    cachedTokens,
  };
}

export function addNormalizedUsage(
  a: NormalizedUsage,
  b: NormalizedUsage,
): NormalizedUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    totalTokens: a.totalTokens + b.totalTokens,
    cachedTokens: a.cachedTokens + b.cachedTokens,
  };
}
