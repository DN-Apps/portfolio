import { createNavigation } from "next-intl/navigation";
import { locales } from "./i18n";

// next-intl kapselt hier locale-aware Routing, damit Links automatisch
// die aktive Sprache mitnehmen statt manuell zusammengesetzt zu werden.
export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  defaultLocale: "de",
});
