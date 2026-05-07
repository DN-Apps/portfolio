"use client";

import { useTranslations } from "next-intl";
import { animationDelay } from "@/utils/animationDelay";
import { pickCmsData } from "@/utils/pickCmsData";
import type { AboutCardContent } from "@/lib/directus";
import "./AboutSection.css";

interface AboutSectionProps {
  cards?: AboutCardContent[];
}

export default function AboutSection({ cards }: AboutSectionProps) {
  const t = useTranslations("about");

  // Die Kartenkonfiguration liegt als Datenstruktur vor, damit Reihenfolge,
  // Icon und Animation ohne dupliziertes JSX gepflegt werden können.
  const fallbackCards = [
    {
      id: "experience",
      icon: "💼",
      title: t("experience"),
      description: t("experience"),
      className: "animate-slide-in-left",
      delay: null,
    },
    {
      id: "current-focus",
      icon: "🎯",
      title: t("current_focus"),
      description: t("current_focus"),
      className: "animate-slide-in-right",
      delay: 0.2,
    },
    {
      id: "strengths",
      icon: "⭐",
      title: t("strengths"),
      description: t("strengths"),
      className: "animate-slide-in-left",
      delay: 0.4,
    },
  ] as const;

  const aboutCards = pickCmsData(cards, fallbackCards, (card, index) => ({
    ...card,
    className:
      index % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right",
    delay: index === 0 ? null : index * 0.2,
  }));

  return (
    <section id="about" className="about-section">
      <div className="container">
        <h2>{t("title")}</h2>
        <div className="about-content">
          {aboutCards.map((card) => (
            <div
              key={card.id}
              // Die Animationsklasse bleibt pro Karte flexibel, weil links und
              // rechts ein alternierender Einstieg visuell ruhiger wirkt.
              className={`about-card ${card.className}`}
              style={
                card.delay === null
                  ? undefined
                  : { animationDelay: animationDelay(card.delay) }
              }
            >
              <h3>
                {card.icon} {card.title}
              </h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
