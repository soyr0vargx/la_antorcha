export type VerifiedSource = {
  id: string;
  organization: string;
  title: string;
  publicationDate: string | null;
  url: string;
  consultedAt: string;
  supports: string;
};

export type NonEmptyArray<T> = readonly [T, ...T[]];

export const verifiedSources: VerifiedSource[] = [];