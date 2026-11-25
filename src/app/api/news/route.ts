import { TavilyKeylessLimitError } from "@tavily/core";
import { NextResponse } from "next/server";
import { getHttpStatus, ResearchServiceError } from "../../../lib/research/errors";
import { createTavilyResearchSourceProvider } from "../../../lib/research/tavily-provider";
import { countryQuery } from "../../../lib/research/country-brief";
import { withResearchTimeout } from "../../../lib/research/timeout";
import { SEARCH_TIMEOUT_MS } from "../../../lib/research/service";

const REGION_QUERIES = {
  world: "conflictos armados y crisis humanitarias en el mundo",
  middleEast: "conflictos armados y situación humanitaria en Medio Oriente",
  europe: "guerra en Ucrania y situación humanitaria en Europa",
  africa: "conflictos armados y crisis humanitarias en África y el Sahel",
  americas: "conflictos armados y crisis humanitarias en América Latina y el Caribe",
  asia: "conflictos armados y situación humanitaria en Asia-Pacífico",
} as const;

type NewsRegion = keyof typeof REGION_QUERIES;

export const maxDuration = 15;

function isNewsRegion(value: unknown): value is NewsRegion {
  return typeof value === "string" && Object.hasOwn(REGION_QUERIES, value);
}

function getErrorStatus(error: unknown): number {
  if (error instanceof ResearchServiceError) {
    if (error.code === "INVALID_QUERY" || error.code === "QUERY_TOO_LONG") return 400;
    if (error.code.includes("QUOTA_EXHAUSTED")) return 429;
    if (error.code.includes("TIMEOUT")) return 504;
    if (error.code.includes("AUTH_FAILED") || error.code.endsWith("_NOT_CONFIGURED")) return 503;
  }

  if (error instanceof TavilyKeylessLimitError) return 429;

  const status = getHttpStatus(error);
  if (status === 429 || status === 432 || status === 433) return 429;
  if (status === 401 || status === 403) return 503;
  return 502;
}

function getErrorMessage(error: unknown, status: number): string {
  if (error instanceof ResearchServiceError) return error.message;
  if (error instanceof TavilyKeylessLimitError || status === 429) {
    return "La búsqueda alcanzó su límite temporal. Inténtalo más tarde.";
  }
  if (status === 503) return "La búsqueda no está disponible en este momento.";
  if (status === 504) return "La búsqueda tardó demasiado. Inténtalo de nuevo.";
  return "No se pudieron consultar las fuentes. Inténtalo más tarde.";
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "La solicitud no contiene JSON válido." },
      { status: 400 },
    );
  }

  const region =
    typeof body === "object" && body !== null && "region" in body
      ? body.region
      : undefined;

  const country =
    typeof body === "object" && body !== null && "country" in body && typeof body.country === "string"
      ? body.country.trim().slice(0, 80)
      : "";

  if (!country && !isNewsRegion(region)) {
    return NextResponse.json(
      { error: "Selecciona una región disponible." },
      { status: 400 },
    );
  }

  try {
    const sourceProvider = createTavilyResearchSourceProvider({
      timeRange: "month",
    });
    const results = await withResearchTimeout(
      (signal) => sourceProvider.search(
        country
          ? countryQuery(country)
          : REGION_QUERIES[region as NewsRegion],
        signal,
      ),
      SEARCH_TIMEOUT_MS,
      "SEARCH_TIMEOUT",
    );

    return NextResponse.json({
      results,
      retrievedAt: results[0]?.retrievedAt ?? new Date().toISOString(),
    });
  } catch (error) {
    const status = getErrorStatus(error);
    if (error instanceof ResearchServiceError) {
      console.error("[news] Source search failed", { code: error.code });
    } else {
      console.error("[news] Source provider request failed", { status: getHttpStatus(error) });
    }

    return NextResponse.json(
      { error: getErrorMessage(error, status) },
      { status },
    );
  }
}
