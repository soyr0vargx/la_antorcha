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