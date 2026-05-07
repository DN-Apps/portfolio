import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

// Die Middleware setzt das Sprachrouting vor dem Rendern um, damit alle
// Seiten dieselbe URL-Struktur /[locale]/... verwenden.
export default createIntlMiddleware({
  locales,
  defaultLocale,
});

export const config = {
  // API, Next-internals und statische Assets bleiben außen vor, weil dort
  // keine Locale-Umschreibung nötig oder sogar störend wäre.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
