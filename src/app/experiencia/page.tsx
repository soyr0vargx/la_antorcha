import { EditorialSectionPage } from "../../components/editorial-section-page";
import { experienceEvidence, experienceThemes } from "../../lib/experience";

export default function ExperiencePage() {
  return (
    <EditorialSectionPage
      index="03"
      title="Experiencia"
      description="Una mirada a lo que la guerra transforma en la vida cotidiana de niños y adolescentes."
    >
      <section className="section-block" aria-labelledby="experience-title">
        <div className="section-block-heading">
          <p className="eyebrow">PROPUESTA EDUCATIVA / EN DESARROLLO</p>
          <h2 id="experience-title">Ponte en su lugar</h2>
          <p>
            Una experiencia para comprender límites y decisiones en una crisis, no para simular
            el sufrimiento ni convertirlo en entretenimiento.
          </p>
        </div>
        <ol className="experience-steps">
          {experienceThemes.map((theme, index) => (
            <li key={theme.id}>
              <span className="editorial-number">0{index + 1}</span>
              <span>{theme.label}</span>
              <span className="eyebrow">ÁMBITO DE APRENDIZAJE</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="section-block" aria-labelledby="experience-evidence-title">
        <div className="section-block-heading">
          <p className="eyebrow">LO QUE DICEN LAS FUENTES</p>
          <h2 id="experience-evidence-title">Datos verificables para cada ámbito.</h2>
        </div>
        <div className="archive-record-list">
          {experienceEvidence.map((item) => (
            <article className="archive-record source-record" key={item.themeId}>
              <p className="eyebrow">{item.label}</p>
              <h3>{item.fact}</h3>
              <a href={item.source.url} rel="noreferrer" target="_blank">
                {item.source.organization}: {item.source.title} ↗
              </a>
            </article>
          ))}
        </div>
      </section>
      <aside className="ethics-note" aria-labelledby="experience-ethics-title">
        <p className="eyebrow">CRITERIO DE DISEÑO</p>
        <h2 id="experience-ethics-title">Comprender, no competir.</h2>
        <p>
          La experiencia evitará puntuaciones, temporizadores y finales de victoria. Cada escena
          deberá incluir contexto y fuentes antes de invitar a reflexionar.
        </p>
      </aside>
    </EditorialSectionPage>
  );
}