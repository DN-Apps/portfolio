"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { splitPipeList } from "@/utils/splitPipeList";
import { pickCmsData } from "@/utils/pickCmsData";
import { staggeredAnimationDelay } from "@/utils/animationDelay";
import type { PersonalCardContent } from "@/lib/directus";
import "./PersonalSection.css";

interface PersonalSectionProps {
  cards?: PersonalCardContent[];
}

export default function PersonalSection({
  cards: cmsCards,
}: PersonalSectionProps) {
  const t = useTranslations("personal");

  const fallbackCards: PersonalCardContent[] = [
    {
      id: "sport",
      imageSrc: "/privates/sport.jpg",
      title: t("sport_title"),
      description: t("sport_text"),
      target: t("sport_goals"),
      why: t("sport_why"),
    },
    {
      id: "woodwork",
      imageSrc: "/privates/waldarbeiten.jpg",
      title: t("woodwork_title"),
      description: t("woodwork_text"),
      target: t("woodwork_goal"),
      why: t("woodwork_useful"),
    },
    {
      id: "diy",
      imageSrc: "/privates/heimwerken.jpg",
      title: t("diy_title"),
      description: t("diy_text"),
      target: t("diy_goal"),
      why: t("diy_useful"),
    },
    {
      id: "action",
      imageSrc: "/privates/skydive.jpg",
      title: t("action_title"),
      description: t("action_text"),
      target: t("action_goals"),
      why: t("action_reflection"),
    },
  ];

  const personalCards = pickCmsData(cmsCards, fallbackCards);

  return (
    <section id="personal" className="personal-section">
      <div className="container">
        <h2>{t("title")}</h2>
        <div className="personal-content">
          {personalCards.map((card, index) => (
            <div
              key={card.id}
              className="personal-card personal-sport-card animate-fade-in-up"
              style={{
                animationDelay: staggeredAnimationDelay(index, 0.1, 0.3),
              }}
            >
              {card.imageSrc ? (
                <div className="personal-sport-image-wrap">
                  <Image
                    src={card.imageSrc}
                    alt={card.title}
                    width={1200}
                    height={700}
                    className="personal-sport-image"
                  />
                </div>
              ) : null}
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              {card.target ? (
                <p className="personal-meta">
                  <strong>{t("sport_goals_label")}:</strong> {card.target}
                </p>
              ) : null}
              {card.why ? (
                <p className="personal-meta">
                  <strong>{t("sport_why_label")}:</strong> {card.why}
                </p>
              ) : null}
              {card.details ? (
                <div className="personal-details-tags">
                  {splitPipeList(card.details).map((detail) => (
                    <span key={detail} className="personal-detail-tag">
                      {detail}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
