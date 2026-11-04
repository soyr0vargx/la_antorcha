export type ResearchSourceKind = "primary" | "journalism";

export type ResearchDocument = {
  id: string;
  organization: string;
  title: string;
  url: string;
  publishedAt: string | null;
  retrievedAt: string;
  excerpt: string;
  sourceKind?: ResearchSourceKind;
  relevanceScore?: number;
};

export interface ResearchSourceProvider {
  search(query: string, signal?: AbortSignal): Promise<ResearchDocument[]>;
}

export type ResearchClaim = {
  text: string;
  sourceIds: string[];
};

export type DatedResearchEvent = ResearchClaim & {
  date: string | null;
};

export type ResearchReportDraft = {
  title: string;
  summary: ResearchClaim[];
  historicalContext: ResearchClaim[];
  recentEvents: DatedResearchEvent[];
  figures: ResearchClaim[];
  humanitarianImpact: ResearchClaim[];
  childAndAdolescentImpact: ResearchClaim[];
  internationalResponse: ResearchClaim[];
  uncertainties: ResearchClaim[];
  documentaryConclusions: ResearchClaim[];
};

export type ResearchCitation = Pick<
  ResearchDocument,
  "id" | "title" | "url" | "organization" | "publishedAt" | "retrievedAt" | "sourceKind"
>;

export type ResearchReport = {
  draft: ResearchReportDraft;
  sources: ResearchCitation[];
}

export interface ResearchAnalyzer {
  analyze(
    query: string,
    documents: ResearchDocument[],
    signal?: AbortSignal,
  ): Promise<ResearchReportDraft>;
}