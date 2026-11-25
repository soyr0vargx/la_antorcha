"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const regions = [
  { id: "world", label: "Mundo" },
  { id: "middleEast", label: "Medio Oriente" },
  { id: "europe", label: "Europa" },
  { id: "africa", label: "África y Sahel" },
  { id: "americas", label: "Américas" },
  { id: "asia", label: "Asia-Pacífico" },
] as const;

type RegionId = (typeof regions)[number]["id"];

type NewsSource = {
  id: string;
  organization: string;
  title: string;
  url: string;
  publishedAt: string | null;
  retrievedAt: string;
  excerpt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNewsSource(value: unknown): value is NewsSource {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.organization === "string"
    && typeof value.title === "string"
    && typeof value.url === "string"
    && (typeof value.publishedAt === "string" || value.publishedAt === null)
    && typeof value.retrievedAt === "string"
    && typeof value.excerpt === "string";
}

function formatRetrievedAt(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Hora de consulta no disponible";
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

async function fetchRegionSources(region: RegionId): Promise<NewsSource[]> {
  const response = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ region }),
  });
  const payload: unknown = await response.json();

  if (!isRecord(payload)) throw new Error("La respuesta de búsqueda no tiene el formato esperado.");
  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string"
        ? payload.error
        : "No se pudieron consultar las fuentes.",
    );
  }
  if (!Array.isArray(payload.results) || !payload.results.every(isNewsSource)) {
    throw new Error("La búsqueda devolvió resultados incompletos.");
  }

  return payload.results;
}

export function NewsCarousel() {
  const [region, setRegion] = useState<RegionId>("world");
  const [loadedRegion, setLoadedRegion] = useState<RegionId | null>(null);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialRequestRef = useRef<Promise<NewsSource[]> | null>(null);

  useEffect(() => {
    let active = true;
    let initialRequest = initialRequestRef.current;
    if (!initialRequest) {
      initialRequest = fetchRegionSources("world");
      initialRequestRef.current = initialRequest;
    }

    initialRequest
      .then((results) => {
        if (!active) return;
        setSources(results);
        setLoadedRegion("world");
        setHasSearched(true);
        setCurrentIndex(0);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudieron consultar las fuentes.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      isPaused
      || isHovered
      || sources.length < 2
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % sources.length);
    }, 7000);
    return () => window.clearInterval(interval);
  }, [isHovered, isPaused, sources.length]);

  async function loadSources(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const results = await fetchRegionSources(region);
      setSources(results);
      setLoadedRegion(region);
      setHasSearched(true);
      setCurrentIndex(0);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron consultar las fuentes.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const currentSource = sources[currentIndex];
  const loadedRegionLabel = regions.find(({ id }) => id === loadedRegion)?.label ?? "";

  return (
    <section aria-labelledby="news-title" className="news-section" id="noticias">
      <div className="news-heading">
        <div>
          <p className="eyebrow">CONSULTA INICIAL AL ABRIR LA PORTADA</p>
          <h2 id="news-title">Noticias y reportes</h2>
          <p>
            Extractos de fuentes identificables. Puedes actualizar la búsqueda y elegir otra región.
          </p>
        </div>
        <form className="news-controls" onSubmit={(event) => void loadSources(event)}>
          <label className="sr-only" htmlFor="news-region">Región de búsqueda</label>
          <select
            id="news-region"
            onChange={(event) => setRegion(event.target.value as RegionId)}
            value={region}
          >
            {regions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          <button disabled={isLoading} type="submit">
            {isLoading ? "Consultando…" : "Actualizar fuentes"}
          </button>
        </form>
      </div>

      {error && <p className="news-error" role="alert">{error}</p>}

      {currentSource ? (
        <article
          className="news-card"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="news-card-meta">
            <span>{loadedRegionLabel}</span>
            <span>
              {currentIndex + 1} / {sources.length}
            </span>
          </div>
          <h3>
            <a href={currentSource.url} rel="noreferrer" target="_blank">
              {currentSource.title}
            </a>
          </h3>
          <p className="news-excerpt">{currentSource.excerpt}</p>
          <div className="news-card-footer">
            <div>
              <span className="eyebrow">FUENTE</span>
              <strong>{currentSource.organization}</strong>
            </div>
            <div>
              <span className="eyebrow">PUBLICACIÓN</span>
              <span>{currentSource.publishedAt ?? "Fecha no indicada"}</span>
            </div>
            <div>
              <span className="eyebrow">CONSULTA</span>
              <span>{formatRetrievedAt(currentSource.retrievedAt)}</span>
            </div>
          </div>
          {sources.length > 1 && (
            <div className="news-pagination" aria-label="Controles de noticias">
              <button
                aria-label="Fuente anterior"
                onClick={() => setCurrentIndex((index) => (index - 1 + sources.length) % sources.length)}
                type="button"
              >
                Anterior
              </button>
              <button
                aria-pressed={isPaused}
                onClick={() => setIsPaused((paused) => !paused)}
                type="button"
              >
                {isPaused ? "Reanudar rotación" : "Pausar rotación"}
              </button>
              <button
                aria-label="Siguiente fuente"
                onClick={() => setCurrentIndex((index) => (index + 1) % sources.length)}
                type="button"
              >
                Siguiente
              </button>
            </div>
          )}
        </article>
      ) : (
        <div aria-live="polite" className="news-empty">
          <p>
            {isLoading
              ? "Buscando resultados en fuentes seleccionadas…"
              : hasSearched
                ? `No se encontraron fuentes admitidas para ${loadedRegionLabel}. Prueba otra región.`
                : "Elige una región y consulta para cargar resultados con enlaces y extractos."}
          </p>
        </div>
      )}

      <p className="news-disclaimer">
        Los extractos no sustituyen la lectura de la fuente original ni una verificación editorial.
      </p>
    </section>
  );
}
