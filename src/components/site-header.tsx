import Link from "next/link";
import { siteNavigation } from "../lib/site-sections";
import { DisplayPreferences } from "./display-preferences";

function NavigationLinks() {
  return siteNavigation.map(({ label, href }) => (
    <Link href={href} key={href}>
      {label}
    </Link>
  ));
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="La Antorcha contra la Guerra, inicio">
          <span className="brand-mark" aria-hidden="true">
            LA
          </span>
          <span className="brand-name">
            LA ANTORCHA
            <span>CONTRA LA GUERRA</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          <NavigationLinks />
        </nav>

        <DisplayPreferences />

        <details className="mobile-nav">
          <summary>
            <span>MENÚ</span>
            <span className="menu-mark" aria-hidden="true">
              +
            </span>
          </summary>
          <nav className="mobile-nav-panel" aria-label="Navegación principal">
            <NavigationLinks />
          </nav>
        </details>
      </div>
    </header>
  );
}