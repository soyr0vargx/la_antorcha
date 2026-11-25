import { tavily } from "@tavily/core";
import type { ResearchDocument } from "../research-context";
import { ResearchServiceError } from "./errors";
import { classifySource, getSourceOrganization, preferredSourceDomains } from "./source-policy";

export type TavilyAnswer = { answer: string; documents: ResearchDocument[] };

// Research without Gemini: Tavily writes the answer from its own search results.
export async function tavilyAnswer(query: string): Promise<TavilyAnswer> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new ResearchServiceError("TAVILY_NOT_CONFIGURED", "El proveedor de búsqueda no está configurado.");

  const response = await tavily({ apiKey }).search(
    `${query}. Responde en español: contexto, situación actual, impacto humanitario y en niños y adolescentes.`,
    {
      searchDepth: "advanced",
      includeAnswer: "advanced",
      maxResults: 8,
      includeDomains: preferredSourceDomains(),
      includeDomainsMode: "prefer",
      includePublishedDate: true,
      timeout: 25,
    },
  );

  const retrievedAt = new Date().toISOString();
  const documents = response.results
    .filter((result) => classifySource(result.url) && result.title?.trim())
    .slice(0, 8)
    .map((result, index) => ({
      id: `S${index + 1}`,
      organization: getSourceOrganization(result.url),
      title: result.title.trim(),
      url: result.url,
      publishedAt: result.publishedDate?.trim() || null,
      retrievedAt,
      excerpt: (result.content ?? "").trim().slice(0, 600),
      sourceKind: classifySource(result.url) ?? undefined,
      relevanceScore: result.score,
    }));

  const answer = response.answer?.trim() ?? "";
  if (!answer && !documents.length) {
    throw new ResearchServiceError("NO_RELIABLE_SOURCES", "No se encontraron fuentes fiables para esta consulta.");
  }
  return { answer, documents };
}

export function formatTavilyReport(query: string, { answer, documents }: TavilyAnswer): string {
  const sources = documents.map((source) => `- [${source.id}] ${source.organization}. [${source.title}](${source.url})` +
    `${source.publishedAt ? `\n  - Publicación: ${source.publishedAt}` : ""}`).join("\n");
  const excerpts = documents
    .filter((source) => source.excerpt)
    .map((source) => `- **${source.organization}:** ${source.excerpt} [${source.id}]`)
    .join("\n\n");

  return [
    `# TÍTULO\n\n${query}`,
    `## RESUMEN\n\n${answer || "El buscador no generó un resumen; revisa los extractos y las fuentes."}`,
    `## LO QUE DICEN LAS FUENTES\n\n${excerpts || "Sin extractos disponibles."}`,
    `## FUENTES\n\n${sources || "No hay fuentes disponibles."}`,
    "",
    "> Resumen generado por el buscador de fuentes (Tavily) porque la IA de análisis no estaba disponible. Verifica los datos en las fuentes enlazadas.",
  ].join("\n\n");
}

export type CountryOverview = { description: string; answer: string; documents: ResearchDocument[] };

// Country description + latest conflict news answered by Tavily.
export async function tavilyCountryOverview(country: string): Promise<CountryOverview> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new ResearchServiceError("TAVILY_NOT_CONFIGURED", "El proveedor de búsqueda no está configurado.");
  const client = tavily({ apiKey });

  const [about, news] = await Promise.all([
    client.search(
      `Descripción general de ${country}: ubicación, capital, población, idiomas, forma de gobierno e historia breve. Responde en español.`,
      { searchDepth: "basic", includeAnswer: "basic", maxResults: 3, timeout: 20 },
    ),
    client.search(
      `${country}: últimas noticias de guerra, conflicto armado, violencia y crisis humanitaria. Responde en español qué está pasando ahora.`,
      {
        searchDepth: "advanced",
        includeAnswer: "advanced",
        maxResults: 8,
        timeRange: "month",
        includeDomains: preferredSourceDomains(),
        includeDomainsMode: "prefer",
        includePublishedDate: true,
        timeout: 25,
      },
    ),
  ]);

  const retrievedAt = new Date().toISOString();
  const documents = news.results
    .filter((result) => classifySource(result.url) && result.title?.trim())
    .slice(0, 6)
    .map((result, index) => ({
      id: `S${index + 1}`,
      organization: getSourceOrganization(result.url),
      title: result.title.trim(),
      url: result.url,
      publishedAt: result.publishedDate?.trim() || null,
      retrievedAt,
      excerpt: (result.content ?? "").trim().slice(0, 1_500),
      sourceKind: classifySource(result.url) ?? undefined,
      relevanceScore: result.score,
    }));

  return { description: about.answer?.trim() ?? "", answer: news.answer?.trim() ?? "", documents };
}
