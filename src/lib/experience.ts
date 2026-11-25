import { referenceSources, type VerifiedSource } from "./sources";

export const experienceThemes = [
  { id: "displacement", label: "Desplazamiento" },
  { id: "school-closure", label: "Cierre de escuelas" },
  { id: "family-separation", label: "Separación familiar" },
  { id: "essential-services", label: "Falta de servicios" },
  { id: "insecurity", label: "Inseguridad" },
] as const;

export type ExperienceEvidence = {
  themeId: (typeof experienceThemes)[number]["id"];
  label: string;
  fact: string;
  source: VerifiedSource;
};

export const experienceEvidence: ExperienceEvidence[] = [
  {
    themeId: "displacement",
    label: "Desplazamiento",
    fact: "A finales de 2024 había 123,2 millones de personas desplazadas por la fuerza en el mundo por conflictos, violencia y persecución.",
    source: referenceSources[0],
  },
  {
    themeId: "school-closure",
    label: "Cierre de escuelas",
    fact: "En zonas de conflicto de todo el mundo, las escuelas son objeto de ataques que ponen en peligro la vida y el futuro de niños y niñas.",
    source: referenceSources[7],
  },
  {
    themeId: "family-separation",
    label: "Separación familiar",
    fact: "En Gaza, más de 56.000 niños y niñas han perdido a uno o a ambos progenitores, según UNICEF.",
    source: {
      id: "unicef-gaza-emergencia",
      organization: "UNICEF",
      title: "Los niños y niñas de Gaza necesitan ayuda de emergencia",
      publicationDate: null,
      url: "https://www.unicef.org/es/emergencias/ninos-ninas-gaza-necesitan-ayuda-emergencia-desesperadamente",
      consultedAt: "2026-11-25",
      supports: "Datos de UNICEF sobre niños muertos o heridos, huérfanos, desplazamiento, malnutrición y trauma en Gaza.",
    },
  },
  {
    themeId: "essential-services",
    label: "Falta de servicios",
    fact: "UNICEF advierte que se triplicaron los ataques que dañan los sistemas de agua y saneamiento en zonas de conflicto, privando a la infancia de agua potable.",
    source: {
      id: "unicef-ataques-agua",
      organization: "UNICEF",
      title: "Se triplican los ataques que dañan los sistemas de agua y privan a la infancia de agua potable en zonas de conflicto",
      publicationDate: null,
      url: "https://www.unicef.org/es/comunicados-prensa/se-triplican-ataques-sistemas-agua-privan-la-infancia-agua-potable",
      consultedAt: "2026-11-25",
      supports: "Comunicado de UNICEF sobre ataques a sistemas de agua y sus efectos en la salud infantil.",
    },
  },
  {
    themeId: "insecurity",
    label: "Inseguridad",
    fact: "El informe del Secretario General sobre niños y conflictos armados de 2024 registró 41.370 violaciones graves contra niños, la cifra más alta desde que existe el mandato.",
    source: referenceSources[2],
  },
];
