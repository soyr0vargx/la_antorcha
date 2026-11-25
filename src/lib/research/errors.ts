import type { ResearchDocument } from "../research-context";

export type ResearchErrorCode =
  | "INVALID_QUERY"
  | "QUERY_TOO_LONG"
  | "TAVILY_NOT_CONFIGURED"
  | "GEMINI_NOT_CONFIGURED"
  | "SEARCH_TIMEOUT"
  | "SEARCH_QUOTA_EXHAUSTED"
  | "SEARCH_AUTH_FAILED"
  | "SEARCH_UNAVAILABLE"
  | "NO_RELIABLE_SOURCES"
  | "ANALYSIS_TIMEOUT"
  | "ANALYSIS_QUOTA_EXHAUSTED"
  | "ANALYSIS_AUTH_FAILED"
  | "ANALYSIS_UNAVAILABLE"
  | "ANALYSIS_INCOMPLETE"
  | "INCOMPLETE_REPORT"
  | "EMPTY_ANALYSIS"
  | "INVALID_REPORT"
  | "INVALID_REFERENCE"
  | "UNSUPPORTED_DATE"
  | "UNSUPPORTED_FIGURE";

export class ResearchServiceError extends Error {
  readonly code: ResearchErrorCode;
  readonly retryAfterSeconds: number | null;
  readonly evidenceSources: ResearchDocument[] | null;
  readonly quotaResetAt: string | null;

  constructor(
    code: ResearchErrorCode,
    message: string,
    options: {
      retryAfterSeconds?: number | null;
      cause?: unknown;
      evidenceSources?: ResearchDocument[] | null;
      quotaResetAt?: string | null;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ResearchServiceError";
    this.code = code;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
    this.evidenceSources = options.evidenceSources ?? null;
    this.quotaResetAt = options.quotaResetAt ?? null;
  }
}

export function getHttpStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;

  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const status = candidate.status ?? candidate.statusCode ?? candidate.response?.status;

  return typeof status === "number" && Number.isInteger(status) ? status : null;
}

// Gemini free-tier daily quotas reset at midnight Pacific Time.
export function geminiQuotaResetAt(error: unknown, now = new Date()): string {
  const detail = error instanceof Error ? error.message : JSON.stringify(error ?? "");
  if (!/PerDay/i.test(detail)) return new Date(now.getTime() + 60_000).toISOString();

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23",
    }).formatToParts(now).map(({ type, value }) => [type, Number(value)]),
  );
  const pacificAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const offset = pacificAsUtc - Math.floor(now.getTime() / 1000) * 1000;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1) - offset).toISOString();
}
