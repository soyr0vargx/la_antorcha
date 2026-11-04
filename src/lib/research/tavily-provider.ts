import {
  tavily,
  type TavilyClient,
  type TavilySearchOptions,
} from "@tavily/core";
import type { ResearchDocument, ResearchSourceProvider } from "../research-context";
import { ResearchServiceError } from "./errors";
import {
  DEFAULT_SOURCE_POLICY,
  classifySource,
  getSourceOrganization,
  preferredSourceDomains,
  type ResearchSourcePolicy,
  selectTrustedSources,
} from "./source-policy";

export const MAX_SEARCH_RESULTS = 10;
export const MAX_TAVILY_QUERY_CHARS = 1_500;
export const MAX_SOURCE_EXCERPT_CHARS = 1_500;
export const TAVILY_SEARCH_TIMEOUT_MS = 8_000;
export const MAX_PROVIDER_DOCUMENTS = MAX_SEARCH_RESULTS;

export type TavilySearchClient = Pick<TavilyClient, "search">;

type TavilyProviderOptions = {
  apiKey?: string;
  client?: TavilySearchClient;
  now?: () => Date;
  searchTimeoutMs?: number;
  sourcePolicy?: ResearchSourcePolicy;
};

type TavilySourceDiagnostics = {
  resultsReceived: number;
  resultsAccepted: number;
  discardedUntrustedOrInvalidUrl: number;
  discardedMissingTitle: number;
  discardedMissingExcerpt: number;
  discardedBySelectionLimit: number;
  discardedDuplicateUrl: number;
};

function originalPublishedDate(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeQuery(query: string): string {
  const normalized = query.trim();
  if (!normalized) {
    throw new ResearchServiceError("INVALID_QUERY", "Escribe un tema para investigar.");
  }
  if (normalized.length > MAX_TAVILY_QUERY_CHARS) {
    throw new ResearchServiceError("QUERY_TOO_LONG", "La consulta supera el límite permitido.");
  }
  return normalized;
}

function toResearchDocuments(
  results: Awaited<ReturnType<TavilySearchClient["search"]>>["results"],
  retrievedAt: string,
  sourcePolicy: ResearchSourcePolicy,
): { documents: ResearchDocument[]; diagnostics: TavilySourceDiagnostics } {
  const discarded = {
    untrustedOrInvalidUrl: 0,
    missingTitle: 0,
    missingExcerpt: 0,
  };
  const documents = results.flatMap((result) => {
    const sourceKind = classifySource(result.url, sourcePolicy);
    const title = typeof result.title === "string" ? result.title.trim() : "";
    const excerpt = typeof result.content === "string"
      ? result.content.trim().slice(0, MAX_SOURCE_EXCERPT_CHARS)
      : "";

    if (!sourceKind) {
      discarded.untrustedOrInvalidUrl += 1;
      return [];
    }
    if (!title) {
      discarded.missingTitle += 1;
      return [];
    }
    if (!excerpt) {
      discarded.missingExcerpt += 1;
      return [];
    }

    return [{
      id: "",
      organization: getSourceOrganization(result.url),
      title,
      url: result.url,
      publishedAt: originalPublishedDate(result.publishedDate),
      retrievedAt,
      excerpt,
      sourceKind,
      relevanceScore: Number.isFinite(result.score) ? result.score : 0,
    }];
  });

  const selectedDocuments = selectTrustedSources(documents, MAX_SEARCH_RESULTS, sourcePolicy);
  const seenUrls = new Set<string>();
  const uniqueDocuments = selectedDocuments.filter((document) => {
    if (seenUrls.has(document.url)) return false;
    seenUrls.add(document.url);
    return true;
  });

  return {
    documents: uniqueDocuments.map((document, index) => ({
      ...document,
      id: `S${index + 1}`,
    })),
    diagnostics: {
      resultsReceived: results.length,
      resultsAccepted: uniqueDocuments.length,
      discardedUntrustedOrInvalidUrl: discarded.untrustedOrInvalidUrl,
      discardedMissingTitle: discarded.missingTitle,
      discardedMissingExcerpt: discarded.missingExcerpt,
      discardedBySelectionLimit: documents.length - selectedDocuments.length,
      discardedDuplicateUrl: selectedDocuments.length - uniqueDocuments.length,
    },
  };
}

export function createTavilyResearchSourceProvider(
  options: TavilyProviderOptions = {},
): ResearchSourceProvider {
  const apiKey = options.apiKey ?? process.env.TAVILY_API_KEY;
  const client = options.client ?? (apiKey ? tavily({ apiKey }) : null);

  if (!client) {
    throw new ResearchServiceError(
      "TAVILY_NOT_CONFIGURED",
      "El proveedor de búsqueda no está configurado.",
    );
  }

  const searchTimeoutMs = options.searchTimeoutMs ?? TAVILY_SEARCH_TIMEOUT_MS;
  const sourcePolicy = options.sourcePolicy ?? DEFAULT_SOURCE_POLICY;
  const now = options.now ?? (() => new Date());
  const searchOptions: TavilySearchOptions = {
    searchDepth: "basic",
    maxResults: MAX_SEARCH_RESULTS,
    topic: "general",
    includeDomains: preferredSourceDomains(sourcePolicy),
    includeDomainsMode: "prefer",
    includePublishedDate: true,
    includeRawContent: false,
    includeUsage: true,
    language: "es",
    timeout: searchTimeoutMs,
  };

  return {
    async search(query, signal) {
      if (signal?.aborted) {
        throw new ResearchServiceError(
          "SEARCH_TIMEOUT",
          "La búsqueda fue cancelada.",
        );
      }

      const response = await client.search(normalizeQuery(query), searchOptions);
      const { documents, diagnostics } = toResearchDocuments(
        response.results,
        now().toISOString(),
        sourcePolicy,
      );
      console.info("[research] Tavily source diagnostics", diagnostics);
      return documents;
    },
  };
}