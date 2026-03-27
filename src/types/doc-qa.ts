import type { RouteMetrics } from "@/types/api-metrics";

export type Citation = {
  filename: string;
  quote?: string;
};

export type SearchResultItem = {
  filename?: string;
  relevance?: string;
  text?: string;
};

export type DocQAResponse = {
  answer: string;
  citations: Citation[];
  searchResults: SearchResultItem[];
  model?: string;
  metrics?: RouteMetrics;
};
