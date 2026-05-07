"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { animationDelay } from "@/utils/animationDelay";
import { splitPipeList } from "@/utils/splitPipeList";
import type { HeroContent } from "@/lib/directus";
import "./HeroSection.css";

interface HeroSectionProps {
  content?: HeroContent | null;
}

export default function HeroSection({ content }: HeroSectionProps) {
  const t = useTranslations("hero");
  const heroData = {
    greeting: content?.greeting ?? t("greeting"),
    name: content?.name ?? t("name"),
    passion: content?.passion ?? t("passion"),
    techSkills: content?.tech_skills ?? t("tech_skills"),
    bringsList: content?.brings_list ?? t("brings_list"),
    focusList: content?.focus_list ?? t("focus_list"),
    languagesIntro: content?.languages_intro ?? t("languages_intro"),
    closing: content?.closing ?? t("closing"),
  };

  // Mehrere Textblöcke werden als Pipe-Liste gepflegt und hier in Tags
  // umgewandelt, damit Inhalt und Darstellung sauber getrennt bleiben.
  const renderTagList = (value: string) => (
    <div className="hero-tags">
      {splitPipeList(value).map((tag) => (
        <span key={tag} className="hero-tag">
          {tag}
        </span>
      ))}
    </div>
  );

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-image">
          <Image
            src={content?.portrait ?? "/portrait.webp"}
            alt={heroData.name}
            width={400}
            height={512}
            priority
            sizes="(max-width: 375px) 115px, 140px"
            className="portrait-image"
          />
        </div>
        <div className="hero-text-content">
          <div className="hero-greeting animate-fade-in-up">
            <p>{heroData.greeting}</p>
            <h1>{heroData.name}</h1>
          </div>

          {/* Kleine Delay-Stufen sorgen für einen ruhigeren Einstieg statt
              alles gleichzeitig einzublenden. */}
          <p
            className="hero-passion animate-fade-in-up"
            style={{ animationDelay: animationDelay(0.1) }}
          >
            {heroData.passion}
          </p>
        </div>

        <div className="hero-blocks">
          {/* Die drei Blöcke teilen dieselbe Struktur, unterscheiden sich aber
              im Textinhalt. Darum wird nur der Inhalt variiert. */}
          <div
            className="hero-block animate-fade-in-up"
            style={{ animationDelay: animationDelay(0.2) }}
          >
            <p className="hero-block-title">{t("title")}</p>
            {renderTagList(heroData.techSkills)}
          </div>

          <div
            className="hero-block animate-fade-in-up"
            style={{ animationDelay: animationDelay(0.3) }}
          >
            <p className="hero-block-title">{t("brings")}</p>
            {renderTagList(heroData.bringsList)}
          </div>

          <div
            className="hero-block animate-fade-in-up"
            style={{ animationDelay: animationDelay(0.4) }}
          >
            <p className="hero-block-title">{t("focus")}</p>
            {renderTagList(heroData.focusList)}
          </div>
        </div>

        <div className="hero-footer">
          <p
            className="hero-languages animate-fade-in-up"
            style={{ animationDelay: animationDelay(0.5) }}
          >
            {heroData.languagesIntro}
          </p>

          <p
            className="hero-closing animate-fade-in-up"
            style={{ animationDelay: animationDelay(0.6) }}
          >
            {heroData.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
