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

export const reviewedLiteraryWorks: LiteraryWorkRecord[] = [
  {
    id: "diario-ana-frank",
    title: "El diario de Ana Frank (Het Achterhuis)",
    author: "Anne Frank",
    workType: "Diario",
    publicationDate: "1947",
    historicalContext: "Ana Frank recibió su diario al cumplir 13 años, el 12 de junio de 1942, poco antes de que su familia se escondiera en Ámsterdam durante la ocupación nazi. Su padre, Otto Frank, publicó el diario en 1947; hoy está traducido a más de 75 idiomas.",
    themes: ["Guerra y conflicto", "Memoria", "Derechos humanos"],
    sources: [{
        id: "annefrank-diario",
        organization: "Casa de Ana Frank",
        title: "The diary",
        publicationDate: null,
        url: "https://www.annefrank.org/en/anne-frank/diary",
        consultedAt: "2026-11-25",
        supports: "Historia del diario y su traducción a más de 75 idiomas.",
      }, {
        id: "annefrank-publicacion",
        organization: "Casa de Ana Frank",
        title: "The publication of the diary",
        publicationDate: null,
        url: "https://www.annefrank.org/en/anne-frank/diary/publication-diary",
        consultedAt: "2026-11-25",
        supports: "Publicación del libro en 1947 y sus primeras ediciones.",
      }],
  },
  {
    id: "diario-zlata",
    title: "El diario de Zlata (Zlata’s Diary: A Child’s Life in Wartime Sarajevo)",
    author: "Zlata Filipović",
    workType: "Diario",
    publicationDate: "1993",
    historicalContext: "Diario de una niña durante el asedio de Sarajevo, en la guerra de Bosnia. Ha sido traducido a treinta y seis idiomas; su autora hoy trabaja en cine documental.",
    themes: ["Guerra y conflicto", "Memoria", "Desplazamiento"],
    sources: [{
        id: "onu-autora-zlata",
        organization: "Naciones Unidas",
        title: "Zlata Filipovic",
        publicationDate: null,
        url: "https://www.un.org/en/authors/zlata-filipovi",
        consultedAt: "2026-11-25",
        supports: "Identifica a Zlata Filipović como autora de Zlata’s Diary: A Child’s Life in Wartime Sarajevo.",
      }, {
        id: "prh-zlata",
        organization: "Penguin Random House",
        title: "Zlata Filipovic",
        publicationDate: null,
        url: "https://www.penguinrandomhouse.com/authors/72222/zlata-filipovic",
        consultedAt: "2026-11-25",
        supports: "Datos editoriales: diario de la Bosnia en guerra traducido a 36 idiomas.",
      }],
  },
  {
    id: "persepolis",
    title: "Persépolis",
    author: "Marjane Satrapi",
    workType: "Novela gráfica (memorias)",
    publicationDate: "2000",
    historicalContext: "Memoria gráfica de la infancia de la autora en Irán: la revolución islámica de 1979 y la guerra Irán-Irak vistas desde los ojos de una niña. Fue adaptada al cine de animación.",
    themes: ["Guerra y conflicto", "Memoria", "Derechos humanos"],
    sources: [{
        id: "bbc-satrapi",
        organization: "BBC Mundo",
        title: "Marjane Satrapi, la autora que con «Persepolis» mostró a través de una niña...",
        publicationDate: null,
        url: "https://www.bbc.com/mundo/articles/clypy9gx9e9o",
        consultedAt: "2026-11-25",
        supports: "Explica cómo la obra permitió a millones de lectores entender la Revolución iraní y la guerra Irán-Irak.",
      }, {
        id: "prh-persepolis",
        organization: "Penguin Random House",
        title: "Persépolis / Persepolis: The Story of a Childhood",
        publicationDate: null,
        url: "https://www.penguinrandomhouse.com/books/646920/persepolis--persepolis-the-story-of-a-childhood-by-marjane-satrapi",
        consultedAt: "2026-11-25",
        supports: "Ficha editorial en español.",
      }],
  },
  {
    id: "sin-novedad-frente",
    title: "Sin novedad en el frente (Im Westen nichts Neues)",
    author: "Erich Maria Remarque",
    workType: "Novela",
    publicationDate: "1929",
    historicalContext: "Novela antibelicista sobre la Primera Guerra Mundial basada en la experiencia del autor, reclutado a los 18 años. Narra la vida del joven soldado Paul Bäumer y se centra en el efecto de la guerra en los jóvenes.",
    themes: ["Guerra y conflicto", "Memoria"],
    sources: [{
        id: "britannica-sin-novedad",
        organization: "Encyclopaedia Britannica",
        title: "All Quiet on the Western Front",
        publicationDate: null,
        url: "https://www.britannica.com/topic/All-Quiet-on-the-Western-Front-novel",
        consultedAt: "2026-11-25",
        supports: "Publicación en 1929, argumento y temas de la novela.",
      }, {
        id: "britannica-remarque",
        organization: "Encyclopaedia Britannica",
        title: "Erich Maria Remarque",
        publicationDate: null,
        url: "https://www.britannica.com/biography/Erich-Maria-Remarque",
        consultedAt: "2026-11-25",
        supports: "Biografía del autor: reclutado a los 18 años y herido varias veces.",
      }],
  },
];

export const literaryThemes = [
  "Guerra y conflicto",
  "Desplazamiento",
  "Memoria",
  "Derechos humanos",
];