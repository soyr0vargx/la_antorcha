import { TavilyKeylessLimitError } from "@tavily/core";
import type {
  ResearchAnalyzer,
  ResearchDocument,
  ResearchReport,
  ResearchSourceProvider,
} from "../research-context";
import { ResearchServiceError, getHttpStatus } from "./errors";
import { validateResearchReport } from "./report-validation";
import { selectTrustedSources, type ResearchSourcePolicy } from "./source-policy";
import { withResearchTimeout } from "./timeout";

export const MAX_RESEARCH_QUERY_CHARS = 1_200;
export const MAX_RESEARCH_DOCUMENTS = 10;
export const MAX_TOTAL_EVIDENCE_CHARS = 16_000;
export const SEARCH_TIMEOUT_MS = 9_000;
export const ANALYSIS_TIMEOUT_MS = 40_000;

export type ResearchServiceOptions = {
  sourceProvider: ResearchSourceProvider;
  analyzer: ResearchAnalyzer;
  searchTimeoutMs?: number;
  analysisTimeoutMs?: number;
  sourcePolicy?: ResearchSourcePolicy;
};

function normalizeQuery(query: string): string {
  const normalized = query.trim();
  if (!normalized) {
    throw new ResearchServiceError("INVALID_QUERY", "Escribe un tema para investigar.");
  }
  if (normalized.length > MAX_RESEARCH_QUERY_CHARS) {
    throw new ResearchServiceError("QUERY_TOO_LONG", "La consulta supera el límite permitido.");
  }
  return normalized;
}

function normalizeDocuments(
  documents: ResearchDocument[],
  sourcePolicy?: ResearchSourcePolicy,
): ResearchDocument[] {
  const trusted = selectTrustedSources(documents, MAX_RESEARCH_DOCUMENTS, sourcePolicy);
  let remainingChars = MAX_TOTAL_EVIDENCE_CHARS;

  return trusted.flatMap((document, index) => {
    if (remainingChars <= 0) return [];
    const excerpt = document.excerpt.slice(0, remainingChars);
    remainingChars -= excerpt.length;
    if (!excerpt.trim()) return [];
    return [{ ...document, id: `S${index + 1}`, excerpt }];
  });
}

function normalizeSearchError(error: unknown): ResearchServiceError {
  if (error instanceof ResearchServiceError) return error;

  if (error instanceof TavilyKeylessLimitError) {
    return new ResearchServiceError(
      "SEARCH_QUOTA_EXHAUSTED",
      "Se agotó la cuota de búsqueda disponible.",
      { retryAfterSeconds: error.retryAfter },
    );
  }

  const status = getHttpStatus(error);
  if (status === 429 || status === 432 || status === 433) {
    return new ResearchServiceError("SEARCH_QUOTA_EXHAUSTED", "Se agotó la cuota de búsqueda.");
  }
  if (status === 401 || status === 403) {
    return new ResearchServiceError("SEARCH_AUTH_FAILED", "La búsqueda no está autorizada.");
  }
  return new ResearchServiceError("SEARCH_UNAVAILABLE", "El proveedor de búsqueda no está disponible.");
}

function normalizeAnalysisError(error: unknown): ResearchServiceError {
  if (error instanceof ResearchServiceError) return error;

  const status = getHttpStatus(error);
  if (status === 429) {
    return new ResearchServiceError("ANALYSIS_QUOTA_EXHAUSTED", "Se agotó la cuota de análisis disponible.");
  }
  if (status === 401 || status === 403) {
    return new ResearchServiceError("ANALYSIS_AUTH_FAILED", "El analizador no está autorizado.");
  }
  return new ResearchServiceError("ANALYSIS_UNAVAILABLE", "El analizador no está disponible.");
}

export function createResearchService(options: ResearchServiceOptions) {
  const searchTimeoutMs = options.searchTimeoutMs ?? SEARCH_TIMEOUT_MS;
  const analysisTimeoutMs = options.analysisTimeoutMs ?? ANALYSIS_TIMEOUT_MS;

  return {
    async research(input: string): Promise<ResearchReport> {
      const query = normalizeQuery(input);
      let retrieved: ResearchDocument[];

      try {
        retrieved = await withResearchTimeout(
          (signal) => options.sourceProvider.search(query, signal),
          searchTimeoutMs,
          "SEARCH_TIMEOUT",
        );
      } catch (error) {
        throw normalizeSearchError(error);
      }

      const documents = normalizeDocuments(retrieved, options.sourcePolicy);
      if (documents.length === 0) {
        throw new ResearchServiceError(
          "NO_RELIABLE_SOURCES",
          "No se encontraron fuentes fiables para esta consulta.",
        );
      }

      let draft;
      try {
        draft = await withResearchTimeout(
          (signal) => options.analyzer.analyze(query, documents, signal),
          analysisTimeoutMs,
          "ANALYSIS_TIMEOUT",
        );
      } catch (error) {
        throw normalizeAnalysisError(error);
      }

      const report = validateResearchReport(draft, documents);
      console.info("[research] Report source diagnostics", {
        resultsAccepted: documents.length,
        resultsCited: report.sources.length,
        resultsNotCited: documents.length - report.sources.length,
      });
      return report;
    },
  };
}