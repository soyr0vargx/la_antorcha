import type { VerifiedSource } from "./sources";

export const contributionTypes = [
  { id: "letter", label: "Cartas" },
  { id: "reflection", label: "Reflexiones" },
  { id: "message", label: "Mensajes" },
  { id: "opinion", label: "Opiniones" },
  { id: "question", label: "Preguntas" },
] as const;

export type StudentContributionKind = (typeof contributionTypes)[number]["id"];

export type StudentContribution = {
  id: string;
  kind: StudentContributionKind;
  title: string;
  body: string;
  attribution: string | null;
  consentToPublish: true;
  moderationStatus: "approved";
  publishedAt: string;
};

export const publishedStudentContributions: StudentContribution[] = [];

export const voiceResources: VerifiedSource[] = [
  {
    id: "unicef-hablar-guerra",
    organization: "UNICEF",
    title: "How to talk to your children about conflict and war",
    publicationDate: null,
    url: "https://www.unicef.org/parenting/how-talk-your-children-about-conflict-and-war",
    consultedAt: "2026-11-25",
    supports: "Consejos de UNICEF (en inglés): preguntar primero qué saben y cómo se sienten, hablar con calma y usar un lenguaje adecuado a su edad.",
  },
  {
    id: "onu-resolucion-2250",
    organization: "Naciones Unidas en Colombia",
    title: "¿Qué es la Resolución 2250 de Naciones Unidas, sobre Juventud, Paz y Seguridad?",
    publicationDate: null,
    url: "https://colombia.un.org/es/295084-%C2%BFqu%C3%A9-es-la-resoluci%C3%B3n-2250-de-naciones-unidas-sobre-juventud-paz-y-seguridad",
    consultedAt: "2026-11-25",
    supports: "Explica la resolución del Consejo de Seguridad que reconoce el papel de los jóvenes en la paz, con cinco pilares: participación, protección, prevención, cooperación y desvinculación y reintegración.",
  },
  {
    id: "onu-revision-jps-2025",
    organization: "Naciones Unidas",
    title: "Revisión Temática de 2025 sobre juventud, paz y seguridad",
    publicationDate: "2025",
    url: "https://www.un.org/peacebuilding/sites/www.un.org.peacebuilding/files/documents/2025_yps_thematic_review_es.pdf",
    consultedAt: "2026-11-25",
    supports: "Documento de la ONU sobre la participación de los jóvenes en la prevención y resolución de conflictos.",
  },
  {
    id: "cicr-ninos-en-la-guerra",
    organization: "Comité Internacional de la Cruz Roja (CICR)",
    title: "Los niños en la guerra (módulo educativo)",
    publicationDate: null,
    url: "https://www.icrc.org/sites/default/files/external/doc/es/assets/files/other/0821_cicr_ninos_en_la_guerra.pdf",
    consultedAt: "2026-11-25",
    supports: "Material educativo del CICR para explorar con estudiantes la Convención sobre los Derechos del Niño y el derecho internacional humanitario.",
  },
];
