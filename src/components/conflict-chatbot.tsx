"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatResetTime } from "./ai-limit-notice";

type Claim = {
  text: string;
  sourceIds: string[];
};

type Citation = {
  id: string;
  title: string;
  url: string;
  organization: string;
  publishedAt: string | null;
  retrievedAt: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "error";
  text?: string;
  claims?: Claim[];
  sources?: Citation[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isClaim(value: unknown): value is Claim {
  return isRecord(value)
    && typeof value.text === "string"
    && Array.isArray(value.sourceIds)
    && value.sourceIds.every((sourceId) => typeof sourceId === "string");
}

function isCitation(value: unknown): value is Citation {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.url === "string"
    && typeof value.organization === "string"
    && (typeof value.publishedAt === "string" || value.publishedAt === null)
    && typeof value.retrievedAt === "string";
}

export function ConflictChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendQuestion(text: string) {
    const query = text.trim();
    if (!query || isLoading) return;

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: query },
    ]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const payload: unknown = await response.json();

      if (!isRecord(payload)) {
        throw new Error("La respuesta del servicio no tiene el formato esperado.");
      }
      if (!response.ok) {
        const message = typeof payload.error === "string"
          ? payload.error
          : "No se pudo completar la investigación.";
        throw new Error(
          typeof payload.quotaResetAt === "string"
            ? `${message} Volverá a estar disponible ${formatResetTime(payload.quotaResetAt)} (tu hora local).`
            : message,
        );
      }
      const answerValue = payload.answer;
      const sourceValue = payload.sources;
      if (!Array.isArray(answerValue) || !Array.isArray(sourceValue)) {
        throw new Error("La respuesta llegó incompleta. Inténtalo de nuevo.");
      }
      const claims = answerValue.filter(isClaim);
      const sources = sourceValue.filter(isCitation);
      if (claims.length !== answerValue.length || sources.length !== sourceValue.length) {
        throw new Error("La respuesta llegó incompleta. Inténtalo de nuevo.");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          claims,
          sources,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "error",
          text: error instanceof Error ? error.message : "No se pudo consultar la investigación.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuestion(question);
  }

  return (
    <div className="chatbot">
      {isOpen && (
        <section
          aria-label="Asistente de investigación"
          aria-modal="false"
          className="chatbot-panel"
          role="dialog"
        >
          <div className="chatbot-header">
            <div>
              <p className="eyebrow">INVESTIGACIÓN DOCUMENTAL</p>
              <h2>Preguntar sobre un conflicto</h2>
            </div>
            <button
              aria-label="Cerrar asistente"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              ×
            </button>
          </div>

          <div aria-live="polite" className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <p>
                  Haz una pregunta y buscaré fuentes identificables. Cada consulta se investiga
                  por separado y puede tardar unos segundos.
                </p>
                <button
                  className="chatbot-suggestion"
                  onClick={() => void sendQuestion("¿Cómo afecta el conflicto en Sudán a niños y adolescentes?")}
                  type="button"
                >
                  Impacto en niños y adolescentes en Sudán
                </button>
              </div>
            )}

            {messages.map((message) => (
              <article className={`chat-message is-${message.role}`} key={message.id}>
                {message.text && <p>{message.text}</p>}
                {message.claims?.map((claim, index) => {
                  const citations = claim.sourceIds
                    .map((sourceId) => message.sources?.find((source) => source.id === sourceId))
                    .filter((source): source is Citation => source !== undefined);
                  return (
                    <div className="chat-claim" key={`${message.id}-${index}`}>
                      <p>{claim.text}</p>
                      {citations.length > 0 && (
                        <div className="chat-citations" aria-label="Fuentes de la afirmación">
                          {citations.map((source) => (
                            <a
                              href={source.url}
                              key={source.id}
                              rel="noreferrer"
                              target="_blank"
                              title={`${source.organization}: ${source.title}`}
                            >
                              [{source.id}]
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {message.sources && message.sources.length > 0 && (
                  <details className="chat-source-list">
                    <summary>Ver fuentes consultadas ({message.sources.length})</summary>
                    <ul>
                      {message.sources.map((source) => (
                        <li key={`${message.id}-${source.id}`}>
                          <a href={source.url} rel="noreferrer" target="_blank">
                            {source.organization}: {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </article>
            ))}

            {isLoading && <p className="chatbot-loading" role="status">Buscando y contrastando fuentes…</p>}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="chatbot-question">Tu pregunta</label>
            <input
              autoComplete="off"
              disabled={isLoading}
              id="chatbot-question"
              maxLength={1200}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Escribe una pregunta…"
              ref={inputRef}
              required
              value={question}
            />
            <button disabled={isLoading || !question.trim()} type="submit">
              {isLoading ? "…" : "Enviar"}
            </button>
          </form>
          <p className="chatbot-disclaimer">
            Las respuestas dependen de fuentes recuperadas; verifica la información en los enlaces.
          </p>
        </section>
      )}

      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar asistente de investigación" : "Abrir asistente de investigación"}
        className="chatbot-launcher"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span aria-hidden="true">{isOpen ? "×" : "?"}</span>
        <span>{isOpen ? "Cerrar" : "Preguntar"}</span>
      </button>
    </div>
  );
}
