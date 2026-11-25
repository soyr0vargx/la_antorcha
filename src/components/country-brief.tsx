"use client";

import { useEffect, useState } from "react";
import { AiLimitNotice } from "./ai-limit-notice";

type BriefSource = { id: string; organization: string; title: string; url: string; publishedAt?: string | null };
type BriefClaim = { text: string; sourceIds: string[] };

type State =
  | { status: "loading" }
  | { status: "error"; message: string; quotaResetAt: string | null }
  | {
    status: "done";
    description: string;
    summary: BriefClaim[];
    summaryBy: "gemini" | "tavily";
    sources: BriefSource[];
  };

export function CountryBrief({ country }: { country: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/country-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          setState({
            status: "error",
            message: payload?.error || "No se pudo generar el resumen con IA.",
            quotaResetAt: typeof payload?.quotaResetAt === "string" ? payload.quotaResetAt : null,
          });
          return;
        }
        setState({
          status: "done",
          description: payload.description ?? "",
          summary: payload.summary ?? [],
          summaryBy: payload.summaryBy === "gemini" ? "gemini" : "tavily",
          sources: payload.sources ?? [],
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "error", message: "No se pudo conectar con el servicio de IA.", quotaResetAt: null });
        }
      });

    return () => controller.abort();
  }, [country]);

  if (state.status === "loading") {
    return (
      <p className="research-status country-brief" role="status" data-testid="country-brief-loading">
        Buscando en la web qué está pasando en {country}…
      </p>
    );
  }

  if (state.status === "error") {
    return state.quotaResetAt
      ? <AiLimitNotice message={state.message} resetAt={state.quotaResetAt} />
      : <p className="research-evidence-note" role="alert" data-testid="country-brief-error">{state.message}</p>;
  }

  return (
    <section className="country-brief" aria-label={`Información sobre ${country}`} data-testid="country-brief">
      {state.description && (
        <>
          <p className="eyebrow">SOBRE EL PAÍS · {country.toUpperCase()}</p>
          <p className="country-brief-description" data-testid="country-description">{state.description}</p>
        </>
      )}
      {state.summary.length > 0 && (
        <>
          <p className="eyebrow">QUÉ ESTÁ PASANDO AHORA</p>
          <ul data-testid="country-summary">
            {state.summary.map((claim, index) => (
              <li key={index}>
                {claim.text}{" "}
                {claim.sourceIds.map((id) => {
                  const source = state.sources.find((item) => item.id === id);
                  return source ? (
                    <a className="source-citation" href={source.url} key={id} rel="noreferrer" target="_blank" title={source.title}>
                      [{source.organization}]
                    </a>
                  ) : null;
                })}
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="country-brief-note">
        {state.summaryBy === "gemini" ? "Resumen hecho con IA" : "Resumen hecho por el buscador web"} a partir de
        fuentes del último mes. Verifica los datos en los documentos originales.
      </p>
    </section>
  );
}
