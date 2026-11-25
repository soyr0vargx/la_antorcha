import { NextResponse } from "next/server";
import { generateCountryBrief, type CountryBriefClaim } from "../../../lib/research/country-brief";
import { ResearchServiceError } from "../../../lib/research/errors";
import { tavilyCountryOverview } from "../../../lib/research/tavily-answer";
import { withResearchTimeout } from "../../../lib/research/timeout";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no contiene JSON válido." }, { status: 400 });
  }

  const country = typeof body === "object" && body !== null && "country" in body && typeof body.country === "string"
    ? body.country.trim().slice(0, 80)
    : "";
  if (!country) return NextResponse.json({ error: "Selecciona un país." }, { status: 400 });

  let overview;
  try {
    overview = await tavilyCountryOverview(country);
  } catch (error) {
    console.error("[country-brief] Tavily failed", { detail: error instanceof Error ? error.message.slice(0, 160) : String(error) });
    return NextResponse.json({ error: "No se pudo consultar la web en este momento. Inténtalo de nuevo." }, { status: 503 });
  }

  const { description, answer, documents } = overview;
  let summary: CountryBriefClaim[] = [];
  let summaryBy: "gemini" | "tavily" = "tavily";
  let quotaResetAt: string | null = null;

  if (documents.length) {
    try {
      summary = await withResearchTimeout(
        (signal) => generateCountryBrief(country, documents.slice(0, 5), signal),
        20_000,
        "ANALYSIS_TIMEOUT",
      );
      summaryBy = "gemini";
    } catch (error) {
      if (error instanceof ResearchServiceError) quotaResetAt = error.quotaResetAt;
      console.warn("[country-brief] Gemini unavailable; using Tavily answer");
    }
  }

  if (!summary.length && answer) {
    summary = [{ text: answer, sourceIds: documents.map(({ id }) => id) }];
  }

  if (!summary.length && !description) {
    return NextResponse.json({ error: "No se encontró información reciente sobre este país." }, { status: 404 });
  }

  return NextResponse.json({
    country,
    description,
    summary,
    summaryBy,
    quotaResetAt: summaryBy === "tavily" ? quotaResetAt : null,
    sources: documents.map(({ id, organization, title, url, publishedAt }) => ({ id, organization, title, url, publishedAt })),
  });
}
