import {
  gazaConflictSource,
  sudanConflictSource,
  ukraineConflictSource,
} from "./sources";
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

export const verifiedConflicts: ConflictRecord[] = [
  {
    id: "sudan-2026",
    name: "Conflicto armado en Sudán",
    location: {
      label: "Sudán",
      region: "africa",
      countryCode: "SD",
      mapName: "Sudan",
      coordinates: [30.2, 12.86],
    },
    context: "El informe de situación de UNICEF documenta una crisis extendida por todo Sudán: ataques a civiles e infraestructura, desplazamiento masivo, inseguridad alimentaria, brotes de enfermedades y colapso de servicios. El 15 de abril de 2026 la guerra entró en su cuarto año.",
    startDate: null,
    actors: [],
    currentSituation: "En abril de 2026, UNICEF calculó aproximadamente 8,9 millones de personas desplazadas dentro del país y más de 300.000 nuevos desplazamientos durante ese mes, sobre todo desde Darfur del Norte, Kordofán y Nilo Azul. El informe advierte que algunos retornos ocurren en lugares dañados o inseguros; estas cifras describen ese período, no el presente.",
    humanitarianImpact: "UNICEF informó que la inseguridad y las barreras logísticas y burocráticas restringían la ayuda en zonas como Kordofán, Nilo Azul y Darfur del Norte. También reportó brotes de dengue, malaria, sarampión y hepatitis E, vinculados en el informe al desplazamiento, el saneamiento deficiente y el acceso limitado a la atención médica.",
    impactOnChildren: "El informe describe a millones de niños expuestos a violencia, malnutrición, explotación y largos períodos sin educación. En abril de 2026, 12.200 de las 19.800 escuelas estaban operativas; alrededor del seis por ciento seguía usado como refugio colectivo u ocupado por actores armados. UNICEF apoyó exámenes nacionales para 544.200 estudiantes y revisó a 786.300 menores de cinco años por malnutrición aguda; más de 74.000 ingresaron a tratamiento por malnutrición aguda severa.",
    chronology: [
      { date: "15 de abril de 2026", event: "La guerra entró en su cuarto año, mientras continuaban la violencia, el desplazamiento y la interrupción de servicios." },
      { date: "13–23 de abril de 2026", event: "Se realizaron exámenes nacionales de grado 12; 544.200 estudiantes participaron en más de 3.000 centros." },
      { date: "Abril de 2026", event: "Un ataque con drones contra el Hospital Universitario de Al Deain dejó alrededor de 70 muertos y más de 140 heridos, según UNICEF; entre las personas afectadas había mujeres, niños y trabajadores sanitarios." },
    ],
    sources: [sudanConflictSource],
    investigationQuery: "conflicto armado en Sudán situación humanitaria y efectos en niños",
    reviewedAt: "2026-11-12",
  },
  {
    id: "ukraine-2026",
    name: "Guerra en Ucrania",
    location: {
      label: "Ucrania",
      region: "europe",
      countryCode: "UA",
      mapName: "Ukraine",
      coordinates: [31.1656, 48.3794],
    },
    context: "La apelación humanitaria de UNICEF para 2026 describe cinco años de guerra, ataques intensificados desde abril de 2025, daños a infraestructura crítica y desplazamiento dentro y fuera de Ucrania. La organización advierte que estos factores interrumpen servicios esenciales y afectan la salud mental de niños y familias.",
    startDate: "Febrero de 2022",
    actors: [],
    currentSituation: "Para 2026, UNICEF estimó que 10,8 millones de personas dentro de Ucrania necesitaban asistencia, incluidos 2,2 millones de niños y 3,8 millones de desplazados internos. La apelación también contabiliza cerca de 546.000 refugiados ucranianos en cinco países vecinos. Son estimaciones de planificación para 2026, no un recuento en tiempo real.",
    humanitarianImpact: "UNICEF describe daños a la energía, el agua y los servicios de calefacción, además de obstáculos para acceder a la atención médica en zonas de primera línea. En su apelación se propone atender a cinco millones de personas con agua suficiente y segura; esta cifra es una meta de respuesta, no un resultado ya alcanzado.",
    impactOnChildren: "Al 2 de junio de 2026, la ONU había verificado 791 niños muertos y 2.752 heridos. UNICEF señala riesgos de angustia psicológica y aprendizaje interrumpido: la apelación indica que 316.000 estudiantes aprendían completamente en línea y 681.000 en modalidad combinada. La fuente también registra al menos 1.611 escuelas dañadas o destruidas.",
    chronology: [
      { date: "Febrero de 2022", event: "UNICEF sitúa desde este mes el período de guerra al que atribuye las víctimas infantiles verificadas por la ONU." },
      { date: "Desde abril de 2025", event: "La apelación de UNICEF describe una escalada de ataques que aumenta los riesgos para civiles y servicios esenciales." },
      { date: "Octubre de 2025", event: "UNICEF informa que se intensificaron los ataques contra la infraestructura energética." },
      { date: "2 de junio de 2026", event: "Fecha de corte de las cifras de la ONU de niños muertos y heridos citadas en la apelación." },
    ],
    sources: [ukraineConflictSource],
    investigationQuery: "guerra en Ucrania situación humanitaria y efectos en niños",
    reviewedAt: "2026-11-12",
  },
  {
    id: "gaza-2026",
    name: "Conflicto en la Franja de Gaza",
    location: {
      label: "Franja de Gaza, Palestina",
      region: "asia",
      countryCode: "PS",
      mapName: "Palestine",
      coordinates: [34.3, 31.4],
    },
    context: "La evaluación de UNICEF publicada en julio de 2026 describe desplazamiento reiterado, restricciones a las operaciones de ayuda y daños a infraestructura civil que mantiene los servicios de agua, saneamiento y salud. Sus cifras corresponden al período evaluado a mitad de 2026.",
    startDate: null,
    actors: [],
    currentSituation: "En el informe de mitad de año, UNICEF señaló que 1,9 de los 2,1 millones de habitantes estaban desplazados y expuestos a riesgos sanitarios y ambientales. La evaluación corresponde a julio de 2026; no representa un conteo actualizado al día de hoy.",
    humanitarianImpact: "Durante mayo y junio de 2026, solo 280 de los 633 camiones de ayuda de UNICEF enviados desde Egipto pudieron descargar. UNICEF estimó que el 82 por ciento de las familias sufría inseguridad de agua y que hasta el 70 por ciento no podía acceder a seis litros por persona al día. También informó que casi el 90 por ciento de la infraestructura de agua y saneamiento había sido dañada o destruida.",
    impactOnChildren: "La evaluación vincula la falta de agua segura, el saneamiento interrumpido y las restricciones a la atención sanitaria con riesgos de deshidratación, enfermedades transmitidas por el agua y contagios en centros de salud. La fuente identifica a los niños como población expuesta, pero no ofrece en esos indicadores un desglose numérico exclusivo para menores.",
    chronology: [
      { date: "Mayo–junio de 2026", event: "Solo 280 de 633 camiones de ayuda de UNICEF enviados desde Egipto pudieron descargar, según el informe." },
      { date: "17 de julio de 2026", event: "Fecha del período reportado por UNICEF para su evaluación de mitad de año sobre las necesidades de los niños." },
    ],
    sources: [gazaConflictSource],
    investigationQuery: "situación humanitaria en Gaza desplazamiento y efectos en niños",
    reviewedAt: "2026-11-12",
  },
];