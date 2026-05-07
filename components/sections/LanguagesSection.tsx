"use client";

import { useTranslations } from "next-intl";
import { staggeredAnimationDelay } from "@/utils/animationDelay";
import { pickCmsData } from "@/utils/pickCmsData";
import type { LanguageContent } from "@/lib/directus";
import "./LanguagesSection.css";

type LanguageItem = {
  id: "german" | "english" | "serbian" | "french" | "italian";
  proficiency: number;
};

// Die Werte bleiben zentral konfiguriert, weil Übersetzungen nur den Namen
// liefern sollen, nicht aber fachliche Prozentwerte.
const languageConfig: LanguageItem[] = [
  { id: "german", proficiency: 100 },
  { id: "english", proficiency: 90 },
  { id: "serbian", proficiency: 90 },
  { id: "french", proficiency: 40 },
  { id: "italian", proficiency: 20 },
];

function getLevelLabel(proficiency: number): string {
  // Die Textstufen werden aus Prozenten abgeleitet, damit Anzeige und Balken
  // immer denselben Bewertungsstand verwenden.
  // Zur Übersetzung geben wir den Key zurück und mappen erst im Component-Layer.
  if (proficiency >= 100) {
    return "level_fluent";
  }

  if (proficiency >= 75) {
    return "level_negotiation";
  }

  if (proficiency >= 50) {
    return "level_everyday";
  }

  if (proficiency >= 25) {
    return "level_basic";
  }

  return "level_basic";
}

interface LanguagesSectionProps {
  items?: LanguageContent[];
}

export default function LanguagesSection({
  items: cmsLanguages,
}: LanguagesSectionProps) {
  const t = useTranslations("languages");

  // Erst hier werden Konfigurationsdaten mit Übersetzungen verheiratet, damit
  // die statische Fachlogik sprachunabhängig bleibt.
  const languages = pickCmsData(
    cmsLanguages,
    languageConfig.map((item) => ({
      id: item.id,
      name: t(item.id),
      proficiency: item.proficiency,
      level: t(getLevelLabel(item.proficiency)),
    })),
    (item) => ({
      id: item.id,
      name: item.name,
      proficiency: item.proficiency,
      level: t(getLevelLabel(item.proficiency)),
    }),
  );

  return (
    <section id="languages" className="languages-section">
      <div className="container">
        <h2>{t("title")}</h2>
        <div className="languages-grid">
          {languages.map((lang, index) => (
            <div
              key={lang.id}
              className="language-card animate-fade-in-up"
              style={{ animationDelay: staggeredAnimationDelay(index, 0.1) }}
            >
              <div className="language-header">
                <p className="language-name">{lang.name}</p>
                <span className="language-percent">{lang.proficiency}%</span>
              </div>
              <div className="language-bar">
                <div
                  className="language-progress"
                  style={{
                    // Die Breite treibt den sichtbaren Fortschritt, die
                    // Verzögerung lässt die Balken gestaffelt aufbauen.
                    width: `${lang.proficiency}%`,
                    transitionDelay: `${lang.proficiency * 5}ms`,
                  }}
                ></div>
              </div>
              <p className="language-level">{lang.level}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
