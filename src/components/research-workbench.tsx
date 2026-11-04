"use client";

import { useState, type FormEvent, type ReactNode } from "react";

type ApiResponse = {
  result?: string;
  error?: string;
};

type ReportSection = {
  title: string;
  content: string;
};

const suggestedQueries = [
  "Guerra en Ucrania",
  "Conflicto en Gaza",
  "Guerra civil de Sudán",
  "Niños desplazados",
  "Ataques contra escuelas",
  "Consecuencias de la guerra en adolescentes",
];


function splitReport(markdown: string): ReportSection[] {
  const headings = [...markdown.matchAll(/^#{1,2}\s+(.+?)\s*$/gm)];

  if (headings.length === 0) {
    return [{ title: "INFORME", content: markdown.trim() }];
  }

  return headings.map((heading, index) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;

    return {
      title: heading[1].trim(),
      content: markdown.slice(start, end).trim(),
    };
  });
}

function renderInline(markdown: string): ReactNode[] {
  const tokens = markdown.split(/(\*\*.*?\*\*|\*.*?\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|\[S\d+\])/g);

  return tokens.filter(Boolean).map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);

    if (link) {
      return (
        <a href={link[2]} key={index} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }

    const citation = token.match(/^\[(S\d+)\]$/);
    if (citation) {
      return (
        <a
          aria-label={`Ir a la fuente ${citation[1]}`}
          className="source-citation"
          href={`#source-${citation[1]}`}
          key={index}
        >
          {token}
        </a>
      );
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }

    return token;
  });
}

function MarkdownBlocks({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{2,6})\s+(.+)$/);
    if (heading) {
      blocks.push(
        <h3 key={`heading-${index}`}>
          {renderInline(heading[2])}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={`quote-${index}`}>
          {renderInline(quoteLines.join(" "))}
        </blockquote>,
      );
      continue;
    }

    const isOrdered = /^\d+[.)]\s+/.test(line);
    const isUnordered = /^[-*+]\s+/.test(line);
    if (isOrdered || isUnordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].trim();
        const matchesListType = isOrdered
          ? /^\d+[.)]\s+/.test(item)
          : /^[-*+]\s+/.test(item);

        if (!matchesListType) break;

        items.push(item.replace(isOrdered ? /^\d+[.)]\s+/ : /^[-*+]\s+/, ""));
        index += 1;
      }

      const List = isOrdered ? "ol" : "ul";
      blocks.push(
        <List key={`list-${index}`}>
          {items.map((item, itemIndex) => {
            const sourceId = item.match(/^\[(S\d+)\]/)?.[1];
            return (
              <li
                id={sourceId ? `source-${sourceId}` : undefined}
                key={`${itemIndex}-${item.slice(0, 24)}`}
              >
                {renderInline(item)}
              </li>
            );
          })}
        </List>,
      );
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        /^(#{2,6})\s+/.test(next) ||
        /^>\s?/.test(next) ||
        /^[-*+]\s+/.test(next) ||
        /^\d+[.)]\s+/.test(next)
      ) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}>{renderInline(paragraph.join(" "))}</p>);
  }

  return <div className="markdown-content">{blocks}</div>;
}


function ResearchReport({ markdown }: { markdown: string }) {
  const sections = splitReport(markdown);
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  const titleSection = sections.find(
    (section) => normalize(section.title) === "TITULO",
  );
  const summarySection = sections.find(
    (section) => normalize(section.title) === "RESUMEN",
  );

  const articleSections = sections.filter((section) => {
    const title = normalize(section.title);
    return title !== "TITULO" && title !== "RESUMEN";
  });

  const articleTitle =
    titleSection?.content.split(/\r?\n/).find((line) => line.trim())?.trim();

  return (
    <article className="research-report" aria-labelledby="report-title">
      <div className="report-topline">
        <span>INFORME DE INVESTIGACIÓN</span>
        <span>VOCES JÓVENES / DOSSIER</span>
      </div>

      <header className="report-header">
        <p className="eyebrow">LECTURA DOCUMENTAL</p>
        <h2 id="report-title">
          {articleTitle ? renderInline(articleTitle) : "Informe de investigación"}
        </h2>
      </header>

      {summarySection && (
        <section className="report-summary" aria-labelledby="report-summary-title">
          <p className="eyebrow" id="report-summary-title">RESUMEN</p>
          <MarkdownBlocks content={summarySection.content} />
        </section>
      )}

      <div className="report-sections">
        {articleSections.map((section, index) => (
          <section className="report-section" key={`${section.title}-${index}`}>
            <h3>{section.title}</h3>
            <MarkdownBlocks content={section.content} />
          </section>
        ))}
      </div>
    </article>
  );
}

export function ResearchWorkbench({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submitResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const researchQuery = query.trim();
    if (!researchQuery || pending) return;

    setPending(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: researchQuery }),
      });
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(payload.error || `No se pudo completar la solicitud (${response.status}).`);
      }

      if (typeof payload.result !== "string" || !payload.result.trim()) {
        throw new Error("La respuesta llegó sin contenido. Prueba con otra consulta.");
      }

      setResult(payload.result);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo conectar con el servicio de investigación.",
      );
    } finally {
      setPending(false);
    }
  }

  function chooseSuggestion(suggestion: string) {
    setQuery(suggestion);
    setError(null);
  }

  function resetResearch() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="research-workbench">
      <div className="research-heading">
        <div>
          <p className="eyebrow">INVESTIGACIÓN ABIERTA <span>·</span> 01</p>
          <h2>¿Qué conflicto quieres investigar?</h2>
        </div>
        <p className="research-intro">
          Una pregunta para empezar. Una mirada humana para comprender lo que hay detrás.
        </p>
      </div>

      <form className="research-form" onSubmit={submitResearch}>
        <label className="sr-only" htmlFor="research-query">
          ¿Qué conflicto quieres investigar?
        </label>
        <input
          autoComplete="off"
          id="research-query"
          maxLength={1_200}
          name="query"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Escribe un conflicto, una región o una pregunta"
          required
          value={query}
        />
        <button disabled={pending || !query.trim()} type="submit">
          {pending ? "Investigando…" : "Investigar"}
          <span aria-hidden="true">↗</span>
        </button>
      </form>

      {!result && !pending && (
        <div className="suggestions" aria-label="Temas sugeridos">
          <span className="suggestions-label">PARA EMPEZAR</span>
          <div className="suggestion-list">
            {suggestedQueries.map((suggestion) => (
              <button
                className="suggestion"
                key={suggestion}
                onClick={() => chooseSuggestion(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {pending && (
        <div className="research-status" role="status" aria-live="polite">
          <span className="status-rule" aria-hidden="true" />
          <span>Preparando el informe. Puede tardar unos momentos.</span>
        </div>
      )}

      {error && (
        <div className="research-error" role="alert">
          <div>
            <p className="eyebrow">NO SE PUDO COMPLETAR</p>
            <p>{error}</p>
          </div>
          <button type="button" onClick={resetResearch}>Volver a intentarlo</button>
        </div>
      )}

      {result && (
        <div className="research-result">
          <div className="result-actions">
            <p className="eyebrow">CONSULTA <span>·</span> {query}</p>
            <button className="text-button" onClick={resetResearch} type="button">
              Nueva investigación <span aria-hidden="true">↗</span>
            </button>
          </div>
          <ResearchReport markdown={result} />
        </div>
      )}
    </div>
  );
}