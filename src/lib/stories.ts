import type { VerifiedSource } from "./sources";

export type PublishedTestimony = {
  id: string;
  title: string;
  summary: string;
  source: VerifiedSource;
  subjectConsentVerified: true;
};

export const publishedTestimonies: PublishedTestimony[] = [
  {
    id: "gaza-infancia-desplazada",
    title: "La infancia desplazada en Gaza",
    summary: "UNICEF calcula alrededor de 1,7 millones de desplazados internos por la guerra en Gaza, y la mitad son niños y niñas. Las familias se ven obligadas a moverse hacia zonas pequeñas y superpobladas, sin servicios adecuados de agua.",
    source: {
      id: "unicef-gaza-infancia-desplazada",
      organization: "UNICEF",
      title: "La infancia desplazada en Gaza",
      publicationDate: null,
      url: "https://www.unicef.org/es/historias/infancia-desplazada-en-gaza",
      consultedAt: "2026-11-25",
      supports: "Historia de UNICEF sobre niños y niñas desplazados en Gaza y las condiciones de los lugares donde buscan refugio.",
    },
    subjectConsentVerified: true,
  },
  {
    id: "gaza-galeria-onu",
    title: "Los niños desplazados de Gaza: una historia de pérdida y dolor",
    summary: "Galería de Noticias ONU con imágenes y testimonios de niñas y niños en campamentos de tiendas en Gaza. Incluye la declaración de Jonathan Crickx (UNICEF Palestina): ningún niño debería verse expuesto jamás a ese nivel de violencia.",
    source: {
      id: "onu-galeria-ninos-gaza",
      organization: "Noticias ONU",
      title: "Los niños desplazados de Gaza: Una desgarradora historia de pérdida y dolor",
      publicationDate: null,
      url: "https://news.un.org/es/gallery/1527642",
      consultedAt: "2026-11-25",
      supports: "Galería fotográfica de Noticias ONU sobre niños desplazados en Gaza, con declaraciones de UNICEF.",
    },
    subjectConsentVerified: true,
  },
  {
    id: "zlata-sarajevo",
    title: "Toda niña o niño que sobrevive a una guerra tiene dos historias",
    summary: "Zlata Filipović, nacida en Sarajevo y autora de El diario de Zlata, recuerda en primera persona cuando intentaba hacer una tarea escolar y escuchó los primeros disparos de su vida, y reflexiona sobre la guerra y lo que viene después.",
    source: {
      id: "onu-chronicle-zlata-filipovic",
      organization: "Naciones Unidas, UN Chronicle",
      title: "Every Surviving War Child Has Two Stories: One from the War and One from its Aftermath",
      publicationDate: null,
      url: "https://www.un.org/en/chronicle/article/every-surviving-war-child-has-two-stories-one-war-and-one-its-aftermath",
      consultedAt: "2026-11-25",
      supports: "Testimonio escrito por Zlata Filipović, publicado por la ONU (en inglés), sobre su infancia durante la guerra en Sarajevo.",
    },
    subjectConsentVerified: true,
  },
  {
    id: "refugiada-colombiana-chile",
    title: "Mirando hacia el futuro: una refugiada colombiana en Chile",
    summary: "ACNUR relata la historia de Argenis, que llegó a Chile por tierra con ayuda de otra mujer colombiana y, una vez allí, trabajó en todo lo que pudo mientras reconstruía su vida.",
    source: {
      id: "acnur-refugiada-colombiana-chile",
      organization: "ACNUR",
      title: "Mirando hacia el futuro: testimonio de una refugiada colombiana en Chile",
      publicationDate: null,
      url: "https://www.acnur.org/noticias/historias/mirando-hacia-el-futuro-testimonio-de-una-refugiada-colombiana-en-chile",
      consultedAt: "2026-11-25",
      supports: "Testimonio publicado por ACNUR de una mujer refugiada colombiana.",
    },
    subjectConsentVerified: true,
  },
];