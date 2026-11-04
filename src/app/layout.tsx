import type { Metadata } from "next";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { ReadingControls } from "../components/site-interactions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voces Jóvenes contra la Guerra",
  description:
    "Una plataforma editorial para comprender los conflictos armados desde su dimensión humana, con especial atención a niños y adolescentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <ReadingControls />
      </body>
    </html>
  );
}