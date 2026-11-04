
import { NextResponse } from "next/server";
import { createResearchService } from "../../../lib/research/service";
import { createTavilyResearchSourceProvider } from "../../../lib/research/tavily-provider";
import { createGeminiResearchAnalyzer } from "../../../lib/research/gemini-analyzer";
import { ResearchServiceError } from "../../../lib/research/errors";

export const maxDuration = 60;

function formatClaim(claim: {
  text: string;
  sourceIds: string[];
}): string {
  const citations = claim.sourceIds.map((id) => `[${id}]`).join(" ");
  return `- ${claim.text}${citations ? ` ${citations}` : ""}`;
}

function formatReport(report: Awaited<
  ReturnType<ReturnType<typeof createResearchService>["research"]>
>): string {
  const { draft, sources } = report;        

  const section = (
    title: string,
    claims: { text: string; sourceIds: string[] }[],
  ) =>
    `## ${title}\n\n${
      claims.length
        ? claims.map(formatClaim).join("\n\n")
        : "Las fuentes recuperadas no aportan evidencia suficiente para desarrollar esta sección."
    }`;

  const events = draft.recentEvents.map((event) => ({
    text: `${event.date ? `${event.date}: ` : ""}${event.text}`,
    sourceIds: event.sourceIds,
  }));

  const sourceList = sources
    .map(
      (source) =>
        `- [${source.id}] ${source.organization}. [${source.title}](${source.url})` +
        `${source.publishedAt ? ` — Publicación: ${source.publishedAt}` : ""}` +
        ` — Consultada: ${source.retrievedAt}`,
    )
    .join("\n");

  return [
    `# TÍTULO\n\n${draft.title}`,
    section("RESUMEN", draft.summary),
    section("CONTEXTO", draft.historicalContext),
    section("CRONOLOGÍA Y ACONTECIMIENTOS RECIENTES", events),
    section("IMPACTO HUMANITARIO", draft.humanitarianImpact),
    section("IMPACTO EN NIÑOS Y ADOLESCENTES", draft.childAndAdolescentImpact),
    section("RESPUESTA INTERNACIONAL Y AYUDA HUMANITARIA", draft.internationalResponse),
    section("INFORMACIÓN QUE REQUIERE VERIFICACIÓN", draft.uncertainties),
    "## CIFRAS",
    draft.figures.length
      ? draft.figures.map(formatClaim).join("\n\n")
      : "Las fuentes recuperadas no contienen cifras suficientemente respaldadas.",
    section("CONCLUSIONES DOCUMENTALES", draft.documentaryConclusions),
    "## FUENTES",
    sourceList || "No hay fuentes disponibles.",
    "",
    "> Informe educativo basado en las fuentes consultadas. La presencia de una cita no garantiza por sí sola que una afirmación sea correcta.",
  ].join("\n\n");
}

function getErrorStatus(error: ResearchServiceError): number {
  const code = error.code as string;

  if (code === "INVALID_QUERY" || code === "QUERY_TOO_LONG") return 400;
  if (code.includes("QUOTA_EXHAUSTED")) return 429;
  if (code.includes("TIMEOUT")) return 504;
  if (
    code.includes("AUTH_FAILED") ||
    code === "TAVILY_NOT_CONFIGURED"
  ) return 503;

  return 502;
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "La solicitud no contiene JSON válido." },
        { status: 400 },
      );
    }

    const query =
      typeof body === "object" && body !== null && "query" in body
        ? (body as { query?: unknown }).query
        : undefined;

    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Escribe algo para investigar." },
        { status: 400 },
      );
    }

    const service = createResearchService({
      sourceProvider: createTavilyResearchSourceProvider(),
      analyzer: createGeminiResearchAnalyzer(),
    });

    const report = await service.research(query);

    return NextResponse.json({
      result: formatReport(report),
    });
  } catch (error) {
    if (error instanceof ResearchServiceError) {
      console.error("Error de investigación:", error.code);

      return NextResponse.json(
        { error: error.message },
        { status: getErrorStatus(error) },
      );
    }

    console.error("Error inesperado en investigación:", error);

    return NextResponse.json(
      { error: "No se pudo realizar la investigación. Inténtalo más tarde." },
      { status: 500 },
    );
  }
}