export const SUMMARY_TYPES = ["short", "bullets", "detailed"] as const;

export type SummaryType = (typeof SUMMARY_TYPES)[number];

export interface SummarizeRequestBody {
  text: string;
  summaryType: SummaryType;
}
