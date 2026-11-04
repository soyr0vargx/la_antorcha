import { EditorialSectionPage } from "../../components/editorial-section-page";
import { ArchiveEmptyState } from "../../components/archive-empty-state";
import { contributionTypes, publishedStudentContributions } from "../../lib/student-voice";

export default function OurVoicePage() {
  return (
    <EditorialSectionPage
      index="05"
      title="Nuestra voz"
      description="Un espacio para pensar cómo hablar de la guerra con responsabilidad y humanidad."
    >
      <section className="section-block" aria-labelledby="voice-channel-title">
        <div className="section-block-heading">
          <p className="eyebrow">PARTICIPACIÓN / EN PREPARACIÓN</p>
          <h2 id="voice-channel-title">Escuchar también es parte de encontrar una voz propia.</h2>
          <p>
            Este espacio podrá reunir aportes voluntarios de estudiantes, separados de los
            testimonios documentales.
          </p>
        </div>
        <ul className="voice-channels">
          {contributionTypes.map((type) => (
            <li key={type.id}>
              <span>{type.label}</span>
              <span className="eyebrow">CANAL PREVISTO</span>
            </li>
          ))}
        </ul>
      </section>
      {publishedStudentContributions.length === 0 ? (
        <ArchiveEmptyState
          label="PUBLICACIÓN DESACTIVADA POR AHORA"
          title="No hay aportes estudiantiles publicados."
          description="La participación se abrirá cuando existan pautas de consentimiento, privacidad, moderación y retirada del contenido."
        />
      ) : (
        <div className="archive-record-list">
          {publishedStudentContributions.map((contribution) => (
            <article className="archive-record" key={contribution.id}>
              <p className="eyebrow">{contribution.kind.toUpperCase()}</p>
              <h3>{contribution.title}</h3>
              <p>{contribution.body}</p>
            </article>
          ))}
        </div>
      )}
    </EditorialSectionPage>
  );
}