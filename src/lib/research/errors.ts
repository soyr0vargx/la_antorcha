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
  | "EMPTY_ANALYSIS"
  | "INVALID_REPORT"
  | "INVALID_REFERENCE"
  | "UNSUPPORTED_DATE"
  | "UNSUPPORTED_FIGURE";

export class ResearchServiceError extends Error {
  readonly code: ResearchErrorCode;
  readonly retryAfterSeconds: number | null;

  constructor(
    code: ResearchErrorCode,
    message: string,
    options: { retryAfterSeconds?: number | null; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ResearchServiceError";
    this.code = code;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
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