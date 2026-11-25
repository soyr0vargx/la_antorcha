"use client";

import { useEffect, useState } from "react";
import { CountryBrief } from "./country-brief";

type CountrySource = {
  id: string;
  organization: string;
  title: string;
  url: string;
  excerpt: string;
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; sources: CountrySource[] };

export function CountrySources({ country }: { country: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "No se pudieron consultar las fuentes.");
        setState({ status: "done", sources: Array.isArray(payload.results) ? payload.results : [] });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "No se pudieron consultar las fuentes.",
        });
      });

    return () => controller.abort();
  }, [country]);

  return (
    <>
      <CountryBrief country={country} />
      <SourceList country={country} state={state} />
    </>
  );
}

function SourceList({ country, state }: { country: string; state: State }) {
  if (state.status === "loading") {
    return <p className="research-status" role="status">Buscando fuentes recientes sobre {country}…</p>;
  }
  if (state.status === "error") {
    return <p className="research-evidence-note" role="alert">{state.message}</p>;
  }
  if (!state.sources.length) {
    return <p className="research-evidence-note">No se encontraron fuentes fiables recientes sobre {country}.</p>;
  }

  return (
    <section className="research-evidence" aria-label={`Fuentes recientes sobre ${country}`}>
      <p className="eyebrow">FUENTES RECIENTES · {country.toUpperCase()}</p>
      <div className="research-evidence-list">
        {state.sources.slice(0, 5).map((source) => (
          <article className="research-evidence-card" key={source.id}>
            <p className="eyebrow">{source.organization}</p>
            <h4><a href={source.url} rel="noreferrer" target="_blank">{source.title}</a></h4>
            <p>{source.excerpt.slice(0, 280)}{source.excerpt.length > 280 ? "…" : ""}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
