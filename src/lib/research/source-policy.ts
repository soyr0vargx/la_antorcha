import type { ResearchDocument, ResearchSourceKind } from "../research-context";

export type ResearchSourcePolicy = {
  primaryDomains: readonly string[];
  journalismDomains: readonly string[];
};

export const DEFAULT_SOURCE_POLICY: ResearchSourcePolicy = {
  primaryDomains: [
    "un.org",
    "unicef.org",
    "unhcr.org",
    "ocha.org",
    "reliefweb.int",
    "ohchr.org",
    "who.int",
    "icrc.org",
    "iom.int",
    "unesco.org",
    "wfp.org",
    "europa.eu",
    "gov.uk",
    "gov",
  ],
  journalismDomains: [
    "reuters.com",
    "apnews.com",
    "bbc.com",
    "bbc.co.uk",
    "theguardian.com",
    "france24.com",
    "dw.com",
    "aljazeera.com",
    "npr.org",
    "pbs.org",
    "nytimes.com",
    "washingtonpost.com",
  ],
};

const SOURCE_NAMES: Record<string, string> = {
  "un.org": "Naciones Unidas",
  "unicef.org": "UNICEF",
  "unhcr.org": "ACNUR",
  "ocha.org": "OCHA",
  "reliefweb.int": "ReliefWeb / OCHA",
  "ohchr.org": "ACNUDH",
  "who.int": "OMS",
  "icrc.org": "Comité Internacional de la Cruz Roja",
  "iom.int": "OIM",
  "unesco.org": "UNESCO",
  "wfp.org": "Programa Mundial de Alimentos",
  "europa.eu": "Unión Europea",
  "reuters.com": "Reuters",
  "apnews.com": "Associated Press",
  "bbc.com": "BBC",
  "bbc.co.uk": "BBC",
  "theguardian.com": "The Guardian",
  "france24.com": "France 24",
  "dw.com": "Deutsche Welle",
  "aljazeera.com": "Al Jazeera",
  "npr.org": "NPR",
  "pbs.org": "PBS",
  "nytimes.com": "The New York Times",
  "washingtonpost.com": "The Washington Post",
};

function hostMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function sourceHost(url: string): string | null {
  try {
    const parsed = new URL(url);
    if ((parsed.protocol !== "https:" && parsed.protocol !== "http:") || parsed.username || parsed.password) {
      return null;
    }
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function classifySource(
  url: string,
  policy: ResearchSourcePolicy = DEFAULT_SOURCE_POLICY,
): ResearchSourceKind | null {
  const hostname = sourceHost(url);
  if (!hostname) return null;

  if (policy.primaryDomains.some((domain) => hostMatches(hostname, domain))) {
    return "primary";
  }

  if (policy.journalismDomains.some((domain) => hostMatches(hostname, domain))) {
    return "journalism";
  }

  return null;
}

export function getSourceOrganization(url: string): string {
  const hostname = sourceHost(url);
  if (!hostname) return "Origen no identificado";

  const knownDomain = Object.keys(SOURCE_NAMES).find((domain) => hostMatches(hostname, domain));
  if (knownDomain) return SOURCE_NAMES[knownDomain];
  if (hostname.endsWith(".gov") || hostname.endsWith(".gov.uk")) return hostname;
  return hostname;
}

export function preferredSourceDomains(policy: ResearchSourcePolicy = DEFAULT_SOURCE_POLICY): string[] {
  return [
    ...policy.primaryDomains,
    ...policy.journalismDomains,
  ];
}

export function prioritizeTrustedSources(
  documents: ResearchDocument[],
  policy: ResearchSourcePolicy = DEFAULT_SOURCE_POLICY,
): ResearchDocument[] {
  return documents
    .map((document, index) => ({
      document,
      index,
      kind: classifySource(document.url, policy),
      score: Number.isFinite(document.relevanceScore) ? document.relevanceScore ?? 0 : 0,
    }))
    .filter((entry): entry is typeof entry & { kind: ResearchSourceKind } => entry.kind !== null)
    .sort((left, right) => {
      const sourcePriority = (left.kind === "primary" ? 0 : 1) - (right.kind === "primary" ? 0 : 1);
      return sourcePriority || right.score - left.score || left.index - right.index;
    })
    .map(({ document, kind }) => ({ ...document, sourceKind: kind }));
}

export function selectTrustedSources(
  documents: ResearchDocument[],
  maximum = 5,
  policy: ResearchSourcePolicy = DEFAULT_SOURCE_POLICY,
): ResearchDocument[] {
  const prioritized = prioritizeTrustedSources(documents, policy);
  const primary = prioritized.filter(({ sourceKind }) => sourceKind === "primary");
  const journalism = prioritized.filter(({ sourceKind }) => sourceKind === "journalism");

  if (maximum > 1 && journalism.length > 0) {
    const selected = [...primary.slice(0, maximum - 1), journalism[0]];
    for (const document of prioritized) {
      if (selected.length >= maximum) break;
      if (!selected.includes(document)) selected.push(document);
    }
    return selected;
  }

  return prioritized.slice(0, maximum);
}