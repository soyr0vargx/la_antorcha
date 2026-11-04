import type { VerifiedSource } from "./sources";

export type PublishedTestimony = {
  id: string;
  title: string;
  summary: string;
  source: VerifiedSource;
  subjectConsentVerified: true;
};

export const publishedTestimonies: PublishedTestimony[] = [];