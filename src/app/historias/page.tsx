import { EditorialSectionPage } from "../../components/editorial-section-page";
import { ArchiveEmptyState } from "../../components/archive-empty-state";
import { publishedStudentContributions } from "../../lib/student-voice";
import { publishedTestimonies } from "../../lib/stories";

const studentReflections = publishedStudentContributions.filter(({ kind }) => kind === "reflection");

export default function StoriesPage() {
  return (
    <EditorialSectionPage
      index="02"
      title="Historias"
      description="Una sección para acercarse a las experiencias humanas sin convertirlas en cifras."
    >
      <section className="story-boundary" aria-label="Tipos de contenido">
        <article className="story-origin">
          <p className="eyebrow">01 / TESTIMONIO CON FUENTE</p>
          <h2>Historias publicadas por fuentes identificables.</h2>
          <p>
            Cada testimonio llevará la organización, publicación y enlace de origen. Nunca se
            presentará una historia generada como testimonio real.
          </p>
          {publishedTestimonies.length === 0 ? (
            <ArchiveEmptyState
              title="No hay testimonios incorporados."
              description="El archivo esperará a publicaciones verificables y contexto suficiente antes de mostrar una historia."
            />
          ) : (
            <div className="archive-record-list">
              {publishedTestimonies.map((story) => (
                <article className="archive-record" key={story.id}>
                  <h3>{story.title}</h3>
                  <p>{story.summary}</p>
                  <a href={story.source.url} rel="noreferrer" target="_blank">
                    {story.source.organization}: {story.source.title}
                  </a>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="story-origin student-origin">
          <p className="eyebrow">02 / REFLEXIÓN DE ESTUDIANTE</p>
          <h2>Una voz personal, identificada como tal.</h2>
          <p>
            Las reflexiones estudiantiles tendrán un espacio distinto. No se mezclarán con
            testimonios de personas afectadas por conflictos.
          </p>
          {studentReflections.length === 0 ? (
            <ArchiveEmptyState
              label="ESPACIO PARTICIPATIVO EN PREPARACIÓN"
              title="Aún no hay reflexiones publicadas."
              description="La participación requerirá consentimiento, criterios de moderación y una etiqueta de autoría clara."
            />
          ) : (
            <div className="archive-record-list">
              {studentReflections.map((reflection) => (
                <article className="archive-record" key={reflection.id}>
                  <h3>{reflection.title}</h3>
                  <p>{reflection.body}</p>
                  {reflection.attribution && <p>{reflection.attribution}</p>}
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
      <p className="editorial-principle">Un testimonio necesita una fuente. Una reflexión necesita consentimiento y contexto.</p>
    </EditorialSectionPage>
  );
}