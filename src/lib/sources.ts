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

export const sudanConflictSource: VerifiedSource = {
  id: "sudan-unicef-situation-report-42",
  organization: "UNICEF (vía ReliefWeb)",
  title: "UNICEF Sudan Humanitarian Situation Report No. 42, 30 April 2026",
  publicationDate: "1 de julio de 2026",
  url: "https://reliefweb.int/report/sudan/unicef-sudan-humanitarian-situation-report-no-42-30-april-2026",
  consultedAt: "2026-11-12",
  supports: "Período: abril de 2026. Documenta desplazamiento y retornos, acceso humanitario, ataques a instalaciones de salud, brotes de enfermedades, funcionamiento de escuelas, exámenes nacionales y detección y tratamiento de malnutrición infantil.",
};

export const ukraineConflictSource: VerifiedSource = {
  id: "ukraine-unicef-appeal-2026",
  organization: "UNICEF",
  title: "Ukraine and Refugee Response Appeal",
  publicationDate: null,
  url: "https://www.unicef.org/appeals/ukraine",
  consultedAt: "2026-11-12",
  supports: "Apelación humanitaria 2026. Incluye necesidades y desplazamiento, cifras de niños muertos o heridos verificadas por la ONU al 2 de junio de 2026, daños a escuelas e infraestructura, salud mental, educación y metas planificadas de respuesta.",
};

export const gazaConflictSource: VerifiedSource = {
  id: "gaza-unicef-midyear-2026",
  organization: "UNICEF, Estado de Palestina",
  title: "Humanitarian Situation Update - Analysis of the Response to the Needs of Children at Mid-year 2026",
  publicationDate: "Julio de 2026",
  url: "https://www.unicef.org/sop/reports/humanitarian-situation-update-analysis-response-needs-children-mid-year-2026",
  consultedAt: "2026-11-12",
  supports: "Período reportado: 17 de julio de 2026. Analiza desplazamiento, camiones de ayuda que pudieron descargar durante mayo y junio, inseguridad de agua, daños a infraestructura de saneamiento y acceso a servicios esenciales.",
};

export const referenceSources: VerifiedSource[] = [
  {
    id: "acnur-tendencias-globales-2024",
    organization: "ACNUR",
    title: "Tendencias Globales de Desplazamiento Forzado en 2024",
    publicationDate: null,
    url: "https://www.acnur.org/media/tendencias-globales-de-desplazamiento-forzado-en-2024",
    consultedAt: "2026-11-25",
    supports: "Informe anual de ACNUR. Indica que a finales de 2024 había 123,2 millones de personas desplazadas por la fuerza por conflictos, violencia, persecución y violaciones de derechos humanos.",
  },
  {
    id: "onu-ninos-conflictos-armados-informe-sg",
    organization: "Naciones Unidas (vía ReliefWeb)",
    title: "Los niños y los conflictos armados - Informe del Secretario General (A/80/723-S/2026/357)",
    publicationDate: "2026",
    url: "https://reliefweb.int/report/world/los-ninos-y-los-conflictos-armados-informe-del-secretario-general-a80723-s2026357",
    consultedAt: "2026-11-25",
    supports: "Informe anual del Secretario General: expone las tendencias de las repercusiones de los conflictos armados en los niños y las graves violaciones verificadas por la ONU.",
  },
  {
    id: "onu-dia-proteger-educacion",
    organization: "Naciones Unidas",
    title: "Día Internacional para Proteger la Educación de Ataques",
    publicationDate: null,
    url: "https://www.un.org/es/observances/protect-education-day",
    consultedAt: "2026-11-25",
    supports: "Resume el informe del Secretario General sobre niños y conflictos armados de 2024: 41.370 violaciones graves, la mayor cifra desde la creación del mandato hace casi 30 años.",
  },
  {
    id: "unicef-agenda-proteger-infancia-conflictos",
    organization: "UNICEF",
    title: "Agenda de UNICEF en favor del cambio para proteger a la infancia en conflictos armados",
    publicationDate: null,
    url: "https://www.unicef.org/es/ninos-en-la-mira/agenda-unicef-en-favor-cambio-proteger-ninos-conflictos-armados",
    consultedAt: "2026-11-25",
    supports: "Propuestas de UNICEF para proteger a la infancia durante los conflictos: financiar la recuperación de los niños, el registro de violaciones y la prevención de ataques.",
  },
  {
    id: "unicef-seis-violaciones-graves",
    organization: "UNICEF",
    title: "Seis violaciones graves de los derechos de la infancia en tiempos de guerra",
    publicationDate: null,
    url: "https://www.unicef.org/es/historias/ninos-en-la-mira-seis-graves-violaciones-contra-ninos-en-tiempos-de-guerra",
    consultedAt: "2026-11-25",
    supports: "Explica las seis violaciones graves contra niños en la guerra, entre ellas el reclutamiento y uso de niños por grupos armados y el secuestro.",
  },
  {
    id: "cicr-que-es-dih",
    organization: "Comité Internacional de la Cruz Roja (CICR)",
    title: "¿Qué es el derecho internacional humanitario?",
    publicationDate: null,
    url: "https://www.icrc.org/sites/default/files/document/file_list/4543_que_es_el_dih_spa_bookmarks.pdf",
    consultedAt: "2026-11-25",
    supports: "Ficha del CICR que explica qué es el derecho internacional humanitario, las normas que limitan los efectos de los conflictos armados y protegen a quienes no participan en los combates.",
  },
  {
    id: "ocha-gho-2026",
    organization: "OCHA",
    title: "Global Humanitarian Overview 2026 [EN/AR/ES/FR]",
    publicationDate: "2026",
    url: "https://www.unocha.org/publications/report/world/global-humanitarian-overview-2026-enaresfr",
    consultedAt: "2026-11-25",
    supports: "Panorama Humanitario Global 2026 de la ONU: diagnóstico de las crisis humanitarias del mundo y plan para salvar 87 millones de vidas en 2026. Disponible también en español.",
  },
  {
    id: "unicef-educacion-en-la-mira",
    organization: "UNICEF",
    title: "La educación, en la mira",
    publicationDate: null,
    url: "https://www.unicef.org/es/la-educacion-en-la-mira",
    consultedAt: "2026-11-25",
    supports: "Documenta que en zonas de conflicto de todo el mundo las escuelas son objeto de ataques que ponen en peligro la vida y el futuro de niños y niñas.",
  },
];

export const verifiedSources: VerifiedSource[] = [
  sudanConflictSource,
  ukraineConflictSource,
  gazaConflictSource,
  ...referenceSources,
];