import type { NonEmptyArray, VerifiedSource } from "./sources";

export type ConflictRegion = "africa" | "americas" | "asia" | "europe" | "oceania";

export type ConflictRecord = {
  id: string;
  name: string;
  location: {
    label: string;
    region: ConflictRegion;
    countryCode: string;
    mapName: string;
    coordinates: [longitude: number, latitude: number] | null;
  };
  context: string;
  startDate: string | null;
  actors: string[];
  chronology: { date: string; event: string }[];
  currentSituation: string;
  humanitarianImpact: string;
  impactOnChildren: string;
  sources: NonEmptyArray<VerifiedSource>;
  investigationQuery: string;
  reviewedAt: string;
};

export const verifiedConflicts: ConflictRecord[] = [];