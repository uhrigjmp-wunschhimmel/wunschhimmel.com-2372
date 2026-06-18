import { Helmet } from "react-helmet-async";

type SEOProps = {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
};

// Wiederverwendbare Komponente für Meta-Tags (Titel, Beschreibung, Social-Vorschau).
// Einfach auf jeder Seite oben einbauen, siehe Beispiele unten.
export function SEO({ title, description, image, noindex }: SEOProps) {
  const fullTitle = `${title} | Wunschhimmel`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}

/*
BEISPIEL-VERWENDUNG (nicht Teil der Komponente, nur zur Orientierung):

Auf der Landing Page (/):
  <SEO
    title="Wunschlisten einfach teilen"
    description="Erstelle und teile deine Wunschliste für Geburtstag, Weihnachten oder Hochzeit – mit Amazon-Integration."
  />

Auf dem privaten Dashboard (/list/:id):
  <SEO title="Meine Wunschliste" description="..." noindex />
*/
