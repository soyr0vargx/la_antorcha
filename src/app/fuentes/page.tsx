import { EditorialSectionPage } from "../../components/editorial-section-page";
import { ArchiveEmptyState } from "../../components/archive-empty-state";
import { verifiedSources } from "../../lib/sources";

export default function SourcesPage() {
  return (
    <EditorialSectionPage
      index="06"
      title="Fuentes"
      description="Un espacio para consultar los organismos, documentos y criterios que dan contexto a cada investigación."
    >
      <section className="section-block" aria-labelledby="sources-principle-title">
        <p className="eyebrow">PRINCIPIO DE VERIFICACIÓN</p>
        <h2 className="source-principle" id="sources-principle-title">
          “Si un dato no se puede confirmar, lo decimos.”
        </h2>
        <p className="section-lede">
          Cada registro explicará quién publica, cuándo se publicó y qué afirmación ayuda a verificar.
        </p>
      </section>
      <section className="section-block" aria-labelledby="source-record-title">
        <div className="section-block-heading">
          <p className="eyebrow">REGISTRO DOCUMENTAL</p>
          <h2 id="source-record-title">Qué incluye una fuente.</h2>
        </div>
        <dl className="field-list source-field-list">
          <div><dt>Organización</dt><dd>Autoría institucional o editorial.</dd></div>
          <div><dt>Título y fecha</dt><dd>Identificación de la publicación y cuándo apareció.</dd></div>
          <div><dt>Enlace y consulta</dt><dd>URL de origen y fecha de revisión en el archivo.</dd></div>
          <div><dt>Aporte</dt><dd>Qué información respalda y qué límites tiene.</dd></div>
        </dl>
        {verifiedSources.length === 0 ? (
          <ArchiveEmptyState
            title="El registro de fuentes se está preparando."
            description="Esta lista permanecerá vacía hasta incorporar documentos revisados."
          />
        ) : (
          <div className="archive-record-list">
            {verifiedSources.map((source) => (
              <article className="archive-record source-record" key={source.id}>
                <p className="eyebrow">{source.organization}</p>
                <h3>{source.title}</h3>
                <p>{source.supports}</p>
                <a href={source.url} rel="noreferrer" target="_blank">Abrir fuente ↗</a>
                <p>Consulta: {source.consultedAt}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </EditorialSectionPage>
  );
}