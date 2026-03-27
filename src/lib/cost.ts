/**
 * Rough USD estimates for ops dashboards — not billing truth.
 * Kimi rates: verify on https://platform.moonshot.cn (pricing may change).
 * Values below follow commonly published Kimi K2.5 API tiers (~2025–2026);
 * override via env if needed.
 */
type ModelPricing = {
  inputPer1M: number;
  cachedInputPer1M: number;
  outputPer1M: number;
};

export type CostInput = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  fileSearchCalls?: number;
};

const MODEL_PRICING: Record<string, ModelPricing> = {
  "kimi-k2.5": {
    inputPer1M: 0.45,
    cachedInputPer1M: 0.07,
    outputPer1M: 2.2,
  },
  /** Course doc example (OpenAI); kept for reference if you point MOONSHOT_MODEL at an alias. */
  "gpt-5-mini": {
    inputPer1M: 0.25,
    cachedInputPer1M: 0.025,
    outputPer1M: 2.0,
  },
};

export function estimateCostUsd({
  model,
  inputTokens,
  outputTokens,
  cachedTokens = 0,
  fileSearchCalls = 0,
}: CostInput): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;

  const nonCachedInput = Math.max(inputTokens - cachedTokens, 0);

  const inputCost =
    (nonCachedInput / 1_000_000) * pricing.inputPer1M +
    (cachedTokens / 1_000_000) * pricing.cachedInputPer1M;

  const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;

  const fileSearchCost = (fileSearchCalls / 1000) * 2.5;

  return Number((inputCost + outputCost + fileSearchCost).toFixed(6));
}
