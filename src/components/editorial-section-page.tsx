import type { ReactNode } from "react";

type EditorialSectionPageProps = {
  index: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function EditorialSectionPage({
  index,
  title,
  description,
  children,
}: EditorialSectionPageProps) {
  return (
    <main className="inner-page" id="contenido">
      <section className="inner-hero">
        <div className="inner-hero-meta">
          <span>VOCES JÓVENES CONTRA LA GUERRA</span>
          <span>SECCIÓN {index}</span>
        </div>
        <p className="eyebrow">ARCHIVO EDITORIAL</p>
        <h1>{title}</h1>
        <p className="inner-deck">{description}</p>
      </section>
      <div className="section-content">{children}</div>
    </main>
  );
}