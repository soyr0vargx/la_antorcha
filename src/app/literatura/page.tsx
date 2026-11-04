import { EditorialSectionPage } from "../../components/editorial-section-page";
import { ArchiveEmptyState } from "../../components/archive-empty-state";
import { literaryThemes, reviewedLiteraryWorks } from "../../lib/literature";

export default function LiteraturePage() {
  return (
    <EditorialSectionPage
      index="04"
      title="Literatura"
      description="Palabras, lecturas y memoria como otra forma de acercarse a realidades complejas."
    >
      <section className="section-block" aria-labelledby="literature-theme-title">
        <div className="section-block-heading">
          <p className="eyebrow">LECTURAS / LÍNEAS TEMÁTICAS</p>
          <h2 id="literature-theme-title">Leer también puede abrir preguntas.</h2>
        </div>
        <ul className="theme-list">
          {literaryThemes.map((theme) => <li key={theme}>{theme}</li>)}
        </ul>
      </section>
      <section className="section-block" aria-labelledby="literature-archive-title">
        <div className="section-block-heading">
          <p className="eyebrow">CATÁLOGO DOCUMENTADO</p>
          <h2 id="literature-archive-title">Obras, autoría y contexto.</h2>
          <p>Las fichas incluirán datos bibliográficos y referencias antes de aparecer en el archivo.</p>
        </div>
        {reviewedLiteraryWorks.length === 0 ? (
          <ArchiveEmptyState
            title="El catálogo está por iniciar."
            description="No se muestran títulos ni fragmentos hasta incorporar referencias bibliográficas revisadas."
          />
        ) : (
          <div className="archive-record-list">
            {reviewedLiteraryWorks.map((work) => (
              <article className="archive-record" key={work.id}>
                <p className="eyebrow">{work.workType}</p>
                <h3>{work.title}</h3>
                <p>{work.author} · {work.historicalContext}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </EditorialSectionPage>
  );
}