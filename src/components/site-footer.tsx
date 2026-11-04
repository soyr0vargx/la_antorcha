import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Link className="footer-wordmark" href="/">
          VOCES JÓVENES
          <span>CONTRA LA GUERRA</span>
        </Link>
        <p>
          Comprender los conflictos desde las vidas que atraviesan.
        </p>
        <Link className="footer-source-link" href="/fuentes">
          Fuentes y criterios <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="footer-meta">
        <span>PLATAFORMA EDITORIAL</span>
        <span>© 2026 VOCES JÓVENES</span>
      </div>
    </footer>
  );
}