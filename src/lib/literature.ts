import type { NonEmptyArray, VerifiedSource } from "./sources";

export type LiteraryWorkRecord = {
  id: string;
  title: string;
  author: string;
  workType: string;
  publicationDate: string | null;
  historicalContext: string;
  themes: string[];
  sources: NonEmptyArray<VerifiedSource>;
};

export const reviewedLiteraryWorks: LiteraryWorkRecord[] = [];

export const literaryThemes = [
  "Guerra y conflicto",
  "Desplazamiento",
  "Memoria",
  "Derechos humanos",
];