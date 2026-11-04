import { ResearchWorkbench } from "../../components/research-workbench";
import { Suspense } from "react";

type ResearchPageProps = {
  searchParams: Promise<{ consulta?: string | string[] }>;
};

async function ResearchPrompt({ searchParams }: ResearchPageProps) {
  const { consulta } = await searchParams;
  const initialQuery = Array.isArray(consulta) ? consulta[0] ?? "" : consulta ?? "";

  return <ResearchWorkbench initialQuery={initialQuery} />;
}

export default function ResearchPage({ searchParams }: ResearchPageProps) {
  return (
    <main className="research-page" id="contenido">
      <section className="inner-hero research-page-hero">
        <div className="inner-hero-meta">
          <span>VOCES JÓVENES CONTRA LA GUERRA</span>
          <span>ARCHIVO / 01</span>
        </div>
        <p className="eyebrow">INVESTIGACIÓN ABIERTA</p>
        <h1>Investigar</h1>
        <p className="inner-deck">
          Empezar por una pregunta. Buscar contexto. Comprender cómo los conflictos atraviesan
          la vida de niños y adolescentes.
        </p>
      </section>
      <section className="research-section research-page-form">
        <Suspense fallback={<ResearchWorkbench />}>
          <ResearchPrompt searchParams={searchParams} />
        </Suspense>
      </section>

<section
  className="research-method section-content"
  aria-labelledby="research-method-title"
>
  <p className="eyebrow">MÉTODO / INVESTIGACIÓN DOCUMENTAL</p>
  <h2 id="research-method-title">
    Comprender un conflicto exige contrastar las fuentes.
  </h2>
  <p>
    La investigación combina la búsqueda de fuentes documentales con
    el análisis asistido por inteligencia artificial. Las afirmaciones
    incluyen referencias a los documentos recuperados. Las cifras,
    fechas y acontecimientos deben contrastarse con las fuentes originales
    antes de utilizarse como información confirmada.
  </p>
</section>
</main>
  );
}