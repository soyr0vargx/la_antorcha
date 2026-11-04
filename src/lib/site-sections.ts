export const editorialSections = [
  {
    index: "01",
    title: "Conflictos",
    href: "/conflictos",
    summary: "Contexto antes que simplificaciones.",
  },
  {
    index: "02",
    title: "Historias",
    href: "/historias",
    summary: "Las vidas que existen detrás de cada cifra.",
  },
  {
    index: "03",
    title: "Experiencia",
    href: "/experiencia",
    summary: "Comprender lo que la guerra transforma.",
  },
  {
    index: "04",
    title: "Literatura",
    href: "/literatura",
    summary: "Palabras para mirar de otra manera.",
  },
  {
    index: "05",
    title: "Nuestra voz",
    href: "/nuestra-voz",
    summary: "Una conversación abierta y responsable.",
  },
] as const;

export const siteNavigation = [
  { label: "Inicio", href: "/" },
  { label: "Investigar", href: "/investigar" },
  ...editorialSections.map(({ title, href }) => ({ label: title, href })),
  { label: "Fuentes", href: "/fuentes" },
];