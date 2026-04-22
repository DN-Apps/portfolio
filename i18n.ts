import { getRequestConfig } from "next-intl/server";

// Deutsch ist Fallback, damit unbekannte oder fehlende Locales nicht auf
// einer leeren Seite landen.
export const defaultLocale = "de";
export const locales = ["de", "en", "sr", "fr"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // Nur bekannte Locales werden akzeptiert; alles andere fällt sauber zurück.
  const locale = locales.includes(requested as Locale)
    ? (requested as Locale)
    : defaultLocale;

  return {
    locale,
    // Die Übersetzungen werden pro Request geladen, damit immer nur die
    // tatsächlich benötigte Sprachdatei gebündelt wird.
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
