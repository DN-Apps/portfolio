"use client";

import { useRouter, usePathname } from "@/navigation";
import { locales, type Locale } from "@/i18n";
import "./LanguageSwitcher.css";

interface LanguageSwitcherProps {
  currentLocale: string;
}

// Alle sprachspezifischen Anzeigeinfos liegen in einem Record zusammen,
// damit Name, Kürzel und Flagge nicht separat synchron gehalten werden müssen.
const localeMeta: Record<
  Locale,
  { name: string; shortCode: string; flag: string }
> = {
  de: {
    name: "Deutsch",
    shortCode: "DE",
    flag: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16'%3E%3Crect width='24' height='16' fill='%23000'/%3E%3Crect y='5.333' width='24' height='5.333' fill='%23FF0000'/%3E%3Crect y='10.667' width='24' height='5.333' fill='%23FFCC00'/%3E%3C/svg%3E",
  },
  en: {
    name: "English",
    shortCode: "EN",
    flag: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16'%3E%3Crect width='24' height='16' fill='%23007'/%3E%3Cpath d='M0 0L24 16M24 0L0 16' stroke='%23fff' stroke-width='3'/%3E%3Cpath d='M0 8H24' stroke='%23fff' stroke-width='6'/%3E%3Cpath d='M12 0V16' stroke='%23fff' stroke-width='6'/%3E%3Cpath d='M0 8H24' stroke='%23C8102E' stroke-width='4'/%3E%3Cpath d='M12 0V16' stroke='%23C8102E' stroke-width='4'/%3E%3Cpath d='M0 0L24 16M24 0L0 16' stroke='%23C8102E' stroke-width='2'/%3E%3C/svg%3E",
  },
  sr: {
    name: "srpski",
    shortCode: "SR",
    flag: "https://flagcdn.com/rs.svg",
  },
  fr: {
    name: "Français",
    shortCode: "FR",
    flag: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16'%3E%3Crect width='8' height='16' fill='%230049FF'/%3E%3Crect x='8' width='8' height='16' fill='%23fff'/%3E%3Crect x='16' width='8' height='16' fill='%23EF4135'/%3E%3C/svg%3E",
  },
};

export default function LanguageSwitcher({
  currentLocale,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    // Die Route bleibt gleich, nur die Locale ändert sich. So springt der
    // Nutzer beim Sprachwechsel nicht auf eine andere Seite zurück.
    router.push(pathname, { locale: newLocale });
  };

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label="Language selector"
    >
      {locales.map((locale) => {
        const meta = localeMeta[locale];
        const isCurrent = currentLocale === locale;

        return (
          // CSS blendet je nach Breakpoint Kurz- oder Langform ein. Das JSX
          // enthält daher beide Varianten, damit das Layout flexibel bleibt.
          <button
            type="button"
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={`lang-btn ${isCurrent ? "active" : ""}`}
            title={meta.name}
            aria-label={
              isCurrent ? `${meta.name}, currently selected` : meta.name
            }
            aria-pressed={isCurrent}
          >
            <img
              className="lang-flag-icon"
              src={meta.flag}
              alt={meta.name}
              width={20}
              height={14}
            />
            <span className="lang-code lang-code-short">{meta.shortCode}</span>
            <span className="lang-code lang-code-long">{meta.name}</span>
          </button>
        );
      })}
    </div>
  );
}
