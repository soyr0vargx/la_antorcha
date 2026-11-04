import type {
  ResearchCitation,
  ResearchClaim,
  ResearchDocument,
  ResearchReport,
  ResearchReportDraft,
} from "../research-context";
import { ResearchServiceError } from "./errors";

const MAX_TITLE_CHARS = 180;
const MAX_CLAIM_CHARS = 1_200;
const MAX_CLAIMS_PER_SECTION = 10;
const MAX_REFERENCES_PER_CLAIM = 5;
const DATE_MENTION_PATTERNS = [
  /\b(?:19|20)\d{2}(?:-\d{2}-\d{2})?\b/g,
  /\b\d{1,2}[./-]\d{1,2}[./-](?:19|20)?\d{2}\b/g,
  /\b\d{1,2}\s+de\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(?:19|20)\d{2}\b/gi,
  /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+(?:19|20)\d{2}\b/gi,
];

function invalid(message: string, code: "INVALID_REPORT" | "INVALID_REFERENCE" | "UNSUPPORTED_DATE" | "UNSUPPORTED_FIGURE" = "INVALID_REPORT"): never {
  throw new ResearchServiceError(code, message);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertKeys(value: Record<string, unknown>, allowed: string[], path: string): void {
  const unexpected = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unexpected.length) invalid(`El informe contiene campos no permitidos en ${path}.`);
}

function normalizeEvidence(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function sourceText(document: ResearchDocument): string {
  return normalizeEvidence(`${document.publishedAt ?? ""} ${document.excerpt}`);
}


function normalizeNumber(value: string): string {
  const token = value.replace(/\s/g, "");

  // Reconoce separadores de miles: 1.500 = 1500.
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(token)) {
    return token.replace(/[.,]/g, "");
  }

  // Conserva la diferencia entre decimales y números enteros.
  return token.replace(",", ".");
}


function evidenceContains(
  sourceIds: string[],
  documentsById: Map<string, ResearchDocument>,
  value: string,
): boolean {
  const token = normalizeEvidence(value);
  const numericToken = /^\d[\d.,]*$/.test(value)
    ? normalizeNumber(value)
    : null;

  return sourceIds.some((id) => {
    const document = documentsById.get(id);
    if (!document) return false;

    const text = sourceText(document);

    if (text.includes(token)) return true;

    if (numericToken === null) return false;

    const numbers = text.match(/\b\d[\d.,]*/g) ?? [];

    return numbers.some(
      (number) => normalizeNumber(number) === numericToken,
    );
  });
}

function dateMentions(text: string): string[] {
  const matches = new Set<string>();
  for (const pattern of DATE_MENTION_PATTERNS) {
    for (const match of text.matchAll(pattern)) matches.add(match[0]);
  }
  return [...matches];
}

function assertNoUnsupportedDates(text: string, sourceIds: string[], documentsById: Map<string, ResearchDocument>): void {
  for (const date of dateMentions(text)) {
    if (!evidenceContains(sourceIds, documentsById, date)) {
      invalid("El informe contiene una fecha que no aparece en sus fuentes.", "UNSUPPORTED_DATE");
    }
  }
}

function parseClaim(
  value: unknown,
  path: string,
  documentsById: Map<string, ResearchDocument>,
  options: { requireNumeric?: boolean } = {},
): ResearchClaim {
  if (!isObject(value)) invalid(`Afirmación inválida en ${path}.`);
  assertKeys(value, ["text", "sourceIds"], path);

  const text = typeof value.text === "string" ? value.text.trim() : "";
  if (!text || text.length > MAX_CLAIM_CHARS) invalid(`Texto vacío o demasiado largo en ${path}.`);
  if (/\b(?:https?:\/\/|www\.)\S+/i.test(text)) {
    invalid("El modelo no puede devolver URLs; los enlaces se añaden desde las fuentes recuperadas.");
  }

  if (!Array.isArray(value.sourceIds) || value.sourceIds.length < 1 || value.sourceIds.length > MAX_REFERENCES_PER_CLAIM) {
    invalid(`La afirmación debe incluir referencias recuperadas en ${path}.`, "INVALID_REFERENCE");
  }

  const sourceIds = [...new Set(value.sourceIds)];
  if (sourceIds.length !== value.sourceIds.length || sourceIds.some((id) => typeof id !== "string" || !documentsById.has(id))) {
    invalid(`La afirmación cita una fuente desconocida en ${path}.`, "INVALID_REFERENCE");
  }

  assertNoUnsupportedDates(text, sourceIds, documentsById);

  const numbers = text.match(/\b\d[\d.,]*/g) ?? [];
  if (options.requireNumeric && numbers.length === 0) {
    invalid("Cada elemento de cifras debe contener un valor numérico respaldado.", "UNSUPPORTED_FIGURE");
  }
  for (const number of numbers) {
    if (!evidenceContains(sourceIds, documentsById, number)) {
      invalid("Una afirmación contiene un número que no aparece en sus fuentes.", "UNSUPPORTED_FIGURE");
    }
  }

  return { text, sourceIds };
}


function parseClaims(
  value: unknown,
  path: string,
  documentsById: Map<string, ResearchDocument>,
  options: { minimum?: number; requireNumeric?: boolean } = {},
): ResearchClaim[] {
  if (
    !Array.isArray(value) ||
    value.length > MAX_CLAIMS_PER_SECTION
  ) {
    invalid(`Colección inválida en ${path}.`);
  }

  const claims: ResearchClaim[] = [];

  value.forEach((claim, index) => {
    claims.push(
      parseClaim(
        claim,
        `${path}[${index}]`,
        documentsById,
        options,
      ),
    );
  });

  if (claims.length < (options.minimum ?? 0)) {
    invalid(`No hay suficientes afirmaciones válidas en ${path}.`);
  }

  return claims;
}

function parseRecentEvents(value: unknown, documentsById: Map<string, ResearchDocument>): ResearchReportDraft["recentEvents"] {
  if (!Array.isArray(value) || value.length > MAX_CLAIMS_PER_SECTION) invalid("Cronología inválida.");

  return value.map((event, index) => {
    if (!isObject(event)) invalid(`Acontecimiento inválido en recentEvents[${index}].`);
    assertKeys(event, ["date", "text", "sourceIds"], `recentEvents[${index}]`);
    if (event.date !== null && typeof event.date !== "string") invalid("La fecha del acontecimiento debe ser texto o null.");

    const claim = parseClaim(
      { text: event.text, sourceIds: event.sourceIds },
      `recentEvents[${index}]`,
      documentsById,
    );
    const date = typeof event.date === "string" ? event.date.trim() : null;

    if (date) {
      if (!evidenceContains(claim.sourceIds, documentsById, date)) {
        invalid("La fecha del acontecimiento no aparece en sus fuentes.", "UNSUPPORTED_DATE");
      }
      assertNoUnsupportedDates(date, claim.sourceIds, documentsById);
    }

    return { date, ...claim };
  });
}

function citationFromDocument(document: ResearchDocument): ResearchCitation {
  let url: URL;
  try {
    url = new URL(document.url);
  } catch {
    invalid("Una fuente recuperada tiene una URL inválida.");
  }
  if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
    invalid("Una fuente recuperada tiene una URL no permitida.");
  }

  return {
    id: document.id,
    title: document.title,
    url: document.url,
    organization: document.organization,
    publishedAt: document.publishedAt,
    retrievedAt: document.retrievedAt,
    sourceKind: document.sourceKind,
  };
}

export function validateResearchReport(value: unknown, documents: ResearchDocument[]): ResearchReport {
  if (!isObject(value)) invalid("La respuesta del analizador no es un informe válido.");
  assertKeys(
    value,
    [
      "title",
      "summary",
      "historicalContext",
      "recentEvents",
      "figures",
      "humanitarianImpact",
      "childAndAdolescentImpact",
      "internationalResponse",
      "uncertainties",
      "documentaryConclusions",
    ],
    "report",
  );

  const title = typeof value.title === "string" ? value.title.trim() : "";
  if (!title || title.length > MAX_TITLE_CHARS || /\b(?:https?:\/\/|www\.)\S+/i.test(title) || /\d/.test(title)) {
    invalid("El título del informe está vacío, es demasiado largo o contiene una URL.");
  }

  const documentsById = new Map(documents.map((document) => [document.id, document]));
  const draft: ResearchReportDraft = {
    title,
    summary: parseClaims(value.summary, "summary", documentsById, { minimum: 1 }),
    historicalContext: parseClaims(value.historicalContext, "historicalContext", documentsById),
    recentEvents: parseRecentEvents(value.recentEvents, documentsById),
    figures: parseClaims(
  Array.isArray(value.figures)
    ? value.figures.filter(
        (figure) =>
          isObject(figure) &&
          typeof figure.text === "string" &&
          /\b\d[\d.,]*/.test(figure.text)
      )
    : value.figures,
  "figures",
  documentsById,
  { requireNumeric: true },
),
    humanitarianImpact: parseClaims(value.humanitarianImpact, "humanitarianImpact", documentsById),
    childAndAdolescentImpact: parseClaims(value.childAndAdolescentImpact, "childAndAdolescentImpact", documentsById),
    internationalResponse: parseClaims(value.internationalResponse, "internationalResponse", documentsById),
    uncertainties: parseClaims(value.uncertainties, "uncertainties", documentsById),
    documentaryConclusions: parseClaims(value.documentaryConclusions, "documentaryConclusions", documentsById),
  };

  const referencedIds = new Set<string>();
  for (const claim of [
    ...draft.summary,
    ...draft.historicalContext,
    ...draft.recentEvents,
    ...draft.figures,
    ...draft.humanitarianImpact,
    ...draft.childAndAdolescentImpact,
    ...draft.internationalResponse,
    ...draft.uncertainties,
    ...draft.documentaryConclusions,
  ]) {
    for (const id of claim.sourceIds) referencedIds.add(id);
  }

  const citations = documents.filter(({ id }) => referencedIds.has(id)).map(citationFromDocument);
  return { draft, sources: citations };
}