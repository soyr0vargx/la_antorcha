import { EditorialSectionPage } from "../../components/editorial-section-page";
import { ConflictExplorer } from "../../components/conflict-explorer";
import { verifiedConflicts } from "../../lib/conflicts";

export default function ConflictsPage() {
  return (
    <EditorialSectionPage
      index="01"
      title="Conflictos"
      description="Contexto para comprender los conflictos armados sin reducirlos a una sola historia."
    >
      <section className="section-block" aria-labelledby="conflict-map-title">
        <div className="section-block-heading">
          <p className="eyebrow">ATLAS / ARCHIVO VERIFICADO</p>
          <h2 id="conflict-map-title">Explorar por región</h2>
          <p>
            El explorador está preparado para fichas con ubicación, cronología, impactos y fuentes.
            No muestra marcadores hasta que haya información verificada.
          </p>
        </div>
        <ConflictExplorer conflicts={verifiedConflicts} />
      </section>

      <section className="section-block field-guide" aria-labelledby="conflict-fields-title">
        <div className="section-block-heading">
          <p className="eyebrow">ESTRUCTURA DE CADA FICHA</p>
          <h2 id="conflict-fields-title">Contexto antes que cifras.</h2>
        </div>
        <dl className="field-list">
          <div><dt>Ubicación e inicio</dt><dd>Territorio y fecha respaldados por fuentes.</dd></div>
          <div><dt>Actores y cronología</dt><dd>Hechos atribuidos y ordenados con referencias.</dd></div>
          <div><dt>Situación e impacto</dt><dd>Consecuencias humanitarias, con atención a niños y adolescentes.</dd></div>
          <div><dt>Fuentes</dt><dd>Documentos enlazados y fecha de revisión.</dd></div>
        </dl>
      </section>
    </EditorialSectionPage>
  );
}