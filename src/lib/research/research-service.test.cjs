// CommonJS is used to register TypeScript transpilation before loading the modules under test.
/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  });
  module._compile(result.outputText, filename);
};

const { TavilyKeylessLimitError } = require("@tavily/core");
const { createGeminiResearchAnalyzer, GEMINI_MAX_OUTPUT_TOKENS, GEMINI_RESEARCH_MODEL, MAX_GEMINI_OUTPUT_CHARS } = require("./gemini-analyzer.ts");
const { ResearchServiceError } = require("./errors.ts");
const { validateResearchReport } = require("./report-validation.ts");
const { createResearchService, MAX_RESEARCH_DOCUMENTS, MAX_RESEARCH_QUERY_CHARS, MAX_TOTAL_EVIDENCE_CHARS } = require("./service.ts");
const { classifySource } = require("./source-policy.ts");
const { createTavilyResearchSourceProvider, MAX_PROVIDER_DOCUMENTS, MAX_SOURCE_EXCERPT_CHARS } = require("./tavily-provider.ts");

const source = (overrides = {}) => ({
  id: "S1",
  organization: "UNICEF",
  title: "Informe sobre infancia",
  url: "https://www.unicef.org/reports/children",
  publishedAt: null,
  retrievedAt: "2026-10-08T00:00:00.000Z",
  excerpt: "El informe documenta 12,000 niños afectados por el desplazamiento.",
  sourceKind: "primary",
  relevanceScore: 0.9,
  ...overrides,
});

const validDraft = (overrides = {}) => ({
  title: "Informe de prueba",
  summary: [{ text: "El informe documenta 12,000 niños afectados.", sourceIds: ["S1"] }],
  historicalContext: [],
  recentEvents: [{ date: null, text: "La fuente no aporta una fecha del acontecimiento.", sourceIds: ["S1"] }],
  figures: [{ text: "12,000 niños", sourceIds: ["S1"] }],
  humanitarianImpact: [],
  childAndAdolescentImpact: [],
  internationalResponse: [],
  uncertainties: [],
  documentaryConclusions: [],
  ...overrides,
});

function serviceWith({ documents = [source()], draft = validDraft(), search, analyze } = {}) {
  const calls = { search: 0, analyze: 0 };
  const researchService = createResearchService({
    sourceProvider: {
      async search(query) {
        calls.search += 1;
        if (search) return search(query);
        return documents;
      },
    },
    analyzer: {
      async analyze(query, receivedDocuments) {
        calls.analyze += 1;
        if (analyze) return analyze(query, receivedDocuments);
        return draft;
      },
    },
    searchTimeoutMs: 50,
    analysisTimeoutMs: 50,
  });

  return { researchService, calls };
}

test("source policy prioritizes primary organizations and allows recognized journalism", () => {
  assert.equal(classifySource("https://www.unicef.org/reports/children"), "primary");
  assert.equal(classifySource("https://www.reuters.com/world/example"), "journalism");
  assert.equal(classifySource("https://unicef.org.example.net/fake"), null);
  assert.equal(
    classifySource("https://reports.verified.example/document", {
      primaryDomains: ["verified.example"],
      journalismDomains: ["news.example"],
    }),
    "primary",
  );
});

test("Tavily adapter makes one basic call, caps results, prefers trusted domains, and preserves metadata", async () => {
  let calls = 0;
  let capturedQuery = "";
  let capturedOptions;
  const provider = createTavilyResearchSourceProvider({
    client: {
      async search(query, options) {
        calls += 1;
        capturedQuery = query;
        capturedOptions = options;
        return {
          results: [
            { title: "Press report", url: "https://www.reuters.com/world/report?original=1", content: "Reported event.", score: 0.99, publishedDate: "Tue, 06 Oct 2026 12:00:00 GMT" },
            { title: "Official report", url: "https://www.unicef.org/reports/children?source=search", content: "12,000 children.", score: 0.71, publishedDate: "" },
            { title: "Unverified host", url: "https://unknown.example/article", content: "Not allowed.", score: 1, publishedDate: "2026-10-01" },
            ...Array.from({ length: 8 }, (_, index) => ({
              title: `Report ${index}`,
              url: `https://www.un.org/report/${index}`,
              content: "UN report.",
              score: 0.5,
              publishedDate: undefined,
            })),
          ],
          query,
          responseTime: 0.1,
          images: [],
          requestId: "mock-request",
        };
      },
    },
    now: () => new Date("2026-10-08T00:00:00.000Z"),
  });

  const documents = await provider.search("  conflicto actual  ");

  assert.equal(calls, 1);
  assert.equal(capturedQuery, "conflicto actual");
  assert.equal(capturedOptions.searchDepth, "basic");
  assert.equal(capturedOptions.maxResults, 10);
  assert.equal(capturedOptions.includeDomainsMode, "prefer");
  assert.ok(capturedOptions.includeDomains.includes("unicef.org"));
  assert.equal(documents.length, 10);
  assert.equal(documents[0].organization, "UNICEF");
  assert.equal(documents[0].url, "https://www.unicef.org/reports/children?source=search");
  assert.equal(documents[0].publishedAt, null);
  assert.equal(documents[0].id, "S1");
  assert.ok(documents.some(({ sourceKind }) => sourceKind === "journalism"));
  assert.ok(documents.every(({ url }) => !url.includes("unknown.example")));
});

test("research evidence budgets align with the ten-source provider cap", () => {
  assert.equal(MAX_PROVIDER_DOCUMENTS, 10);
  assert.equal(MAX_RESEARCH_DOCUMENTS, MAX_PROVIDER_DOCUMENTS);
  assert.ok(MAX_TOTAL_EVIDENCE_CHARS >= MAX_RESEARCH_DOCUMENTS * MAX_SOURCE_EXCERPT_CHARS);
  assert.equal(GEMINI_MAX_OUTPUT_TOKENS, 6_144);
  assert.equal(MAX_GEMINI_OUTPUT_CHARS, 24_000);
});

test("Tavily diagnostics log only aggregate rejection counts", async () => {
  const logs = [];
  const originalWarn = console.warn;
  const originalInfo = console.info;
  console.warn = (...args) => logs.push(args);
  console.info = (...args) => logs.push(args);

  try {
    const provider = createTavilyResearchSourceProvider({
      client: {
        async search(query) {
          return {
            results: [
              {
                title: "Private untrusted title",
                url: "https://unknown.example/private-path",
                content: "Private untrusted excerpt",
                score: 0.9,
              },
              {
                title: "",
                url: "https://www.unicef.org/report",
                content: "Trusted excerpt",
                score: 0.8,
              },
              {
                title: "Trusted title",
                url: "https://www.un.org/report",
                content: " ",
                score: 0.7,
              },
            ],
            query,
            responseTime: 0.1,
            images: [],
            requestId: "mock-diagnostics",
          };
        },
      },
    });

    const documents = await provider.search("PRIVATE_USER_QUERY");

    assert.deepEqual(documents, []);
    assert.deepEqual(logs, [[
      "[research] Tavily source diagnostics",
      {
        resultsReceived: 3,
        resultsAccepted: 0,
        discardedUntrustedOrInvalidUrl: 1,
        discardedMissingTitle: 1,
        discardedMissingExcerpt: 1,
        discardedBySelectionLimit: 0,
        discardedDuplicateUrl: 0,
      },
    ]]);

    const serializedLogs = JSON.stringify(logs);
    for (const privateValue of [
      "PRIVATE_USER_QUERY",
      "unknown.example",
      "private-path",
      "Private untrusted title",
      "Private untrusted excerpt",
    ]) {
      assert.equal(serializedLogs.includes(privateValue), false);
    }
  } finally {
    console.warn = originalWarn;
    console.info = originalInfo;
  }
});

test("Tavily diagnostics distinguish an empty result set", async () => {
  const logs = [];
  const originalWarn = console.warn;
  const originalInfo = console.info;
  console.warn = (...args) => logs.push(args);
  console.info = (...args) => logs.push(args);

  try {
    const provider = createTavilyResearchSourceProvider({
      client: {
        async search(query) {
          return {
            results: [],
            query,
            responseTime: 0.1,
            images: [],
            requestId: "mock-empty-diagnostics",
          };
        },
      },
    });

    assert.deepEqual(await provider.search("consulta"), []);
    assert.deepEqual(logs, [[
      "[research] Tavily source diagnostics",
      {
        resultsReceived: 0,
        resultsAccepted: 0,
        discardedUntrustedOrInvalidUrl: 0,
        discardedMissingTitle: 0,
        discardedMissingExcerpt: 0,
        discardedBySelectionLimit: 0,
        discardedDuplicateUrl: 0,
      },
    ]]);
  } finally {
    console.warn = originalWarn;
    console.info = originalInfo;
  }
});

test("Tavily source domains can be configured without replacing the provider", async () => {
  let capturedDomains;
  const provider = createTavilyResearchSourceProvider({
    sourcePolicy: { primaryDomains: ["verified.example"], journalismDomains: ["news.example"] },
    client: {
      async search(query, options) {
        capturedDomains = options.includeDomains;
        return {
          results: [{
            title: "Verified organization",
            url: "https://reports.verified.example/record",
            content: "Verified source excerpt.",
            score: 0.8,
            publishedDate: undefined,
          }],
          query,
          responseTime: 0.1,
          images: [],
          requestId: "mock-custom-policy",
        };
      },
    },
  });

  const documents = await provider.search("consulta");
  assert.deepEqual(capturedDomains, ["verified.example", "news.example"]);
  assert.equal(documents[0].sourceKind, "primary");
  assert.equal(documents[0].url, "https://reports.verified.example/record");
});

test("empty results stop before Gemini analysis", async () => {
  const { researchService, calls } = serviceWith({ documents: [] });

  await assert.rejects(researchService.research("conflicto actual"), (error) => {
    assert.equal(error.code, "NO_RELIABLE_SOURCES");
    return true;
  });
  assert.equal(calls.search, 1);
  assert.equal(calls.analyze, 0);
});

test("the service passes up to ten trusted sources and logs aggregate citation counts", async () => {
  const logs = [];
  const originalInfo = console.info;
  console.info = (...args) => logs.push(args);

  try {
    const documents = Array.from({ length: 10 }, (_, index) =>
      source({
        id: `old-${index + 1}`,
        title: `Informe ${index + 1}`,
        url: `https://www.un.org/reports/${index + 1}`,
        excerpt: `Evidence document ${index + 1}.`,
      }),
    );
    let analyzedDocuments;
    const { researchService } = serviceWith({
      documents,
      analyze: async (_query, receivedDocuments) => {
        analyzedDocuments = receivedDocuments;
        return validDraft({
          summary: [{ text: "La evidencia documentada está disponible.", sourceIds: ["S1"] }],
          figures: [],
        });
      },
    });

    const report = await researchService.research("conflicto actual");

    assert.equal(analyzedDocuments.length, 10);
    assert.equal(report.sources.length, 1);
    assert.deepEqual(logs, [[
      "[research] Report source diagnostics",
      { resultsAccepted: 10, resultsCited: 1, resultsNotCited: 9 },
    ]]);
  } finally {
    console.info = originalInfo;
  }
});

test("overlong queries fail before spending a search request", async () => {
  const { researchService, calls } = serviceWith();
  await assert.rejects(
    researchService.research("x".repeat(MAX_RESEARCH_QUERY_CHARS + 1)),
    { code: "QUERY_TOO_LONG" },
  );
  assert.equal(calls.search, 0);
});

test("unrecognized-only results are not treated as reliable sources", async () => {
  const { researchService } = serviceWith({
    documents: [source({ url: "https://unknown.example/article", organization: "unknown.example" })],
  });

  await assert.rejects(researchService.research("conflicto actual"), { code: "NO_RELIABLE_SOURCES" });
});

test("missing source dates remain null in the report citations", async () => {
  const { researchService } = serviceWith({ documents: [source({ publishedAt: null })] });
  const report = await researchService.research("desplazamiento infantil");

  assert.equal(report.sources[0].publishedAt, null);
  assert.equal(report.draft.recentEvents[0].date, null);
  assert.equal(report.sources[0].url, source().url);
});

test("unknown source identifiers are rejected", () => {
  assert.throws(
    () => validateResearchReport(validDraft({ summary: [{ text: "Claim", sourceIds: ["S99"] }] }), [source()]),
    { code: "INVALID_REFERENCE" },
  );
});

test("model-generated URLs are rejected and source links remain server-derived", () => {
  assert.throws(
    () => validateResearchReport(validDraft({ summary: [{ text: "Fuente: https://inventada.example", sourceIds: ["S1"] }] }), [source()]),
    { code: "INVALID_REPORT" },
  );
});

test("dates and figures unsupported by cited source text are rejected", () => {
  assert.throws(
    () => validateResearchReport(validDraft({ recentEvents: [{ date: "2025", text: "Ocurrió en 2025.", sourceIds: ["S1"] }] }), [source()]),
    { code: "UNSUPPORTED_DATE" },
  );
  assert.throws(
    () => validateResearchReport(validDraft({ figures: [{ text: "99,999 niños", sourceIds: ["S1"] }] }), [source()]),
    { code: "UNSUPPORTED_FIGURE" },
  );
});

test("new report sections require valid citations and retain cited sources", () => {
  const report = validateResearchReport(
    validDraft({
      internationalResponse: [
        { text: "La asistencia está documentada.", sourceIds: ["S1"] },
      ],
      documentaryConclusions: [
        { text: "Las fuentes describen impactos diferenciados.", sourceIds: ["S1"] },
      ],
    }),
    [source()],
  );

  assert.equal(report.draft.internationalResponse.length, 1);
  assert.equal(report.draft.documentaryConclusions.length, 1);
  assert.equal(report.sources.length, 1);
  assert.throws(
    () => validateResearchReport(
      validDraft({
        internationalResponse: [
          { text: "Respuesta documentada.", sourceIds: ["S99"] },
        ],
      }),
      [source()],
    ),
    { code: "INVALID_REFERENCE" },
  );
});

test("Tavily keyless quota errors map to an explicit quota code without retrying", async () => {
  const quotaError = new TavilyKeylessLimitError({
    message: "mock quota",
    capType: "daily",
    retryAfter: 45,
    bonusEligible: false,
    continuationPaths: [],
  });
  const { researchService, calls } = serviceWith({ search: async () => { throw quotaError; } });

  await assert.rejects(researchService.research("conflicto actual"), (error) => {
    assert.equal(error.code, "SEARCH_QUOTA_EXHAUSTED");
    assert.equal(error.retryAfterSeconds, 45);
    return true;
  });
  assert.equal(calls.search, 1);
  assert.equal(calls.analyze, 0);
});

test("HTTP quota responses map to an explicit error", async () => {
  const { researchService } = serviceWith({ search: async () => { throw { response: { status: 432 } }; } });
  await assert.rejects(researchService.research("conflicto actual"), { code: "SEARCH_QUOTA_EXHAUSTED" });
});

test("search authentication and provider HTTP failures are classified without retries", async () => {
  for (const [status, expectedCode] of [[401, "SEARCH_AUTH_FAILED"], [503, "SEARCH_UNAVAILABLE"]]) {
    let attempts = 0;
    const { researchService } = serviceWith({
      search: async () => {
        attempts += 1;
        throw { response: { status } };
      },
    });

    await assert.rejects(researchService.research("conflicto actual"), { code: expectedCode });
    assert.equal(attempts, 1);
  }
});

test("Gemini quota and HTTP failures are classified without retries", async () => {
  for (const [status, expectedCode] of [[429, "ANALYSIS_QUOTA_EXHAUSTED"], [503, "ANALYSIS_UNAVAILABLE"]]) {
    let attempts = 0;
    const { researchService } = serviceWith({
      analyze: async () => {
        attempts += 1;
        throw { status };
      },
    });

    await assert.rejects(researchService.research("conflicto actual"), { code: expectedCode });
    assert.equal(attempts, 1);
  }
});

test("search and analysis timeouts are explicit and do not trigger retries", async () => {
  let searches = 0;
  const searchTimeoutService = createResearchService({
    sourceProvider: { search: () => { searches += 1; return new Promise(() => {}); } },
    analyzer: { analyze: async () => validDraft() },
    searchTimeoutMs: 5,
    analysisTimeoutMs: 20,
  });
  await assert.rejects(searchTimeoutService.research("conflicto actual"), { code: "SEARCH_TIMEOUT" });
  assert.equal(searches, 1);

  const analysisTimeoutService = createResearchService({
    sourceProvider: { search: async () => [source()] },
    analyzer: { analyze: () => new Promise(() => {}) },
    searchTimeoutMs: 20,
    analysisTimeoutMs: 5,
  });
  await assert.rejects(analysisTimeoutService.research("conflicto actual"), { code: "ANALYSIS_TIMEOUT" });
});

test("Gemini receives recovered evidence and a citation-id-only schema without real API calls", async () => {
  let request;
  const analyzer = createGeminiResearchAnalyzer({
    generateContent: async (parameters) => {
      request = parameters;
      return { text: JSON.stringify(validDraft()) };
    },
  });

  await analyzer.analyze("desplazamiento infantil", [source()]);

  assert.equal(request.model, GEMINI_RESEARCH_MODEL);
  assert.match(request.contents, /El informe documenta 12,000 niños afectados por el desplazamiento/);
  assert.doesNotMatch(request.contents, /https:\/\/www\.unicef\.org/);
  assert.equal(request.config.responseMimeType, "application/json");
  assert.deepEqual(request.config.tools, undefined);
  assert.ok(JSON.stringify(request.config.responseJsonSchema).includes('"enum":["S1"]'));
  assert.equal(request.config.responseJsonSchema.properties.internationalResponse.maxItems, 10);
  assert.equal(request.config.responseJsonSchema.properties.documentaryConclusions.maxItems, 5);
});

test("Gemini receives all ten recovered sources and permits only their citation IDs", async () => {
  let request;
  const documents = Array.from({ length: 10 }, (_, index) =>
    source({
      id: `S${index + 1}`,
      title: `Informe ${index + 1}`,
      url: `https://www.un.org/reports/${index + 1}`,
      excerpt: index === 0 ? source().excerpt : `Evidence document ${index + 1}.`,
    }),
  );
  const analyzer = createGeminiResearchAnalyzer({
    generateContent: async (parameters) => {
      request = parameters;
      return { text: JSON.stringify(validDraft()) };
    },
  });

  await analyzer.analyze("conflicto actual", documents);

  const allowedCitationIds =
    request.config.responseJsonSchema.properties.summary.items.properties.sourceIds.items.enum;
  assert.deepEqual(allowedCitationIds, documents.map(({ id }) => id));
  for (const document of documents) {
    assert.ok(request.contents.includes(document.excerpt));
  }
});

test("oversized Gemini output is rejected", async () => {
  const analyzer = createGeminiResearchAnalyzer({
    generateContent: async () => ({ text: "x".repeat(MAX_GEMINI_OUTPUT_CHARS + 1) }),
  });
  await assert.rejects(analyzer.analyze("consulta", [source()]), { code: "INVALID_REPORT" });
});

test("Gemini refuses to initialize without a key when no mock generator is supplied", () => {
  assert.throws(() => createGeminiResearchAnalyzer({ apiKey: "" }), ResearchServiceError);
});