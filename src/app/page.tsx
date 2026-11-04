import Link from "next/link";
import { ResearchWorkbench } from "../components/research-workbench";
import { editorialSections } from "../lib/site-sections";

export default function HomePage() {
  return (
    <main id="contenido">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-topline">
          <span>UNA PLATAFORMA EDITORIAL</span>
          <span>CONFLICTO <i>·</i> INFANCIA <i>·</i> MEMORIA</span>
        </div>

        <div className="hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">MIRAR MÁS ALLÁ DEL FRENTE</p>
            <h1 id="hero-title">
              VOCES JÓVENES
              <span>CONTRA LA GUERRA</span>
            </h1>
            <p className="hero-claim">Detrás de cada cifra hay una vida.</p>
            <div className="hero-bottom">
              <p>
                Un espacio para comprender los conflictos armados desde la perspectiva humana,
                con especial atención a niños y adolescentes.
              </p>
              <Link className="primary-link" href="#investigar">
                Abrir una investigación <span aria-hidden="true">↘</span>
              </Link>
            </div>
          </div>

          <aside className="hero-art" aria-label="Composición editorial: antes que cifras, vidas">
            <div className="art-margin-label">DOSSIER / HUMANIDAD</div>
            <div className="art-sheet">
              <div className="art-rules" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="art-cross" aria-hidden="true" />
              <p className="art-overline">UNA MIRADA HUMANA</p>
              <p className="art-statement">ANTES QUE<br />LA CIFRA</p>
              <div className="art-bottomline">
                <span>VIDA</span>
                <span>MEMORIA</span>
                <span>FUTURO</span>
              </div>
            </div>
            <p className="art-caption">Un archivo abierto a las preguntas difíciles.</p>
          </aside>
        </div>

        <a className="scroll-cue" href="#investigar">
          <span aria-hidden="true">↓</span> DESPLAZARSE
        </a>
      </section>

      <section className="research-section" id="investigar" aria-labelledby="research-title">
        <div className="section-edge">
          <span>01 / INVESTIGACIÓN</span>
          <Link href="/investigar">ABRIR EN PANTALLA COMPLETA <span aria-hidden="true">↗</span></Link>
        </div>
        <ResearchWorkbench />
      </section>

      <section className="human-section" aria-labelledby="human-title">
        <div className="human-section-head">
          <p className="eyebrow">02 / UNA MIRADA HUMANA</p>
          <p className="human-aside">Niños y adolescentes no son una nota al pie de la historia.</p>
        </div>
        <div className="human-statement">
          <span className="human-symbol" aria-hidden="true">≠</span>
          <h2 id="human-title">NO SON<br /><em>SOLO CIFRAS</em></h2>
        </div>
        <div className="human-bottom">
          <p>
            Los datos ayudan a dimensionar una guerra. La perspectiva humana ayuda a comprender
            cómo atraviesa hogares, escuelas y proyectos de vida.
          </p>
          <div className="human-words" aria-label="Hogar, escuela y futuro">
            <span>HOGAR</span>
            <span>ESCUELA</span>
            <span>FUTURO</span>
          </div>
        </div>
      </section>

      <section className="editorial-section" aria-labelledby="editorial-title">
        <div className="editorial-intro">
          <p className="eyebrow">03 / RECORRER EL ARCHIVO</p>
          <h2 id="editorial-title">Una introducción a<br /><em>mirar y escuchar.</em></h2>
          <p>Distintas entradas para acercarse a la realidad de los conflictos.</p>
        </div>
        <div className="editorial-list">
          {editorialSections.map((section) => (
            <Link className="editorial-row" href={section.href} key={section.index}>
              <span className="editorial-number">{section.index}</span>
              <span className="editorial-row-title">{section.title}</span>
              <span className="editorial-row-text">{section.summary}</span>
              <span className="editorial-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="closing-section" aria-labelledby="closing-title">
        <p className="eyebrow">UNA INVITACIÓN</p>
        <h2 id="closing-title">Explora.<br />Comprende.<br /><em>Escucha.</em></h2>
        <Link className="closing-link" href="/investigar">
          Empezar por una pregunta <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}