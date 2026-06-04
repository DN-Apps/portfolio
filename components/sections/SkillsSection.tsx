"use client";

import { useTranslations } from "next-intl";
import { staggeredAnimationDelay } from "@/utils/animationDelay";
import { splitPipeList } from "@/utils/splitPipeList";
import { pickCmsData } from "@/utils/pickCmsData";
import type { SkillGroupContent } from "@/lib/directus";
import "./SkillsSection.css";

interface SkillsSectionProps {
  groups?: SkillGroupContent[];
}

type SkillGroupView = {
  title: string;
  description?: string;
  items: string[];
};

export default function SkillsSection({
  groups: cmsGroups,
}: SkillsSectionProps) {
  const t = useTranslations("skills");

  // Die Gruppen bilden die spätere Kartenstruktur direkt ab. Dadurch liegen
  // Inhalt und Layout-Logik in einem klaren, wiederverwendbaren Format vor.
  const fallbackGroups: SkillGroupView[] = [
    {
      title: t("stack_fullstack_title"),
      description: undefined,
      items: splitPipeList(t("stack_fullstack_items")),
    },
    {
      title: t("stack_lowcode_title"),
      description: undefined,
      items: splitPipeList(t("stack_lowcode_items")),
    },
    {
      title: t("stack_devops_title"),
      description: undefined,
      items: splitPipeList(t("stack_devops_items")),
    },
    {
      title: t("stack_tools_title"),
      description: undefined,
      items: splitPipeList(t("stack_tools_items")),
    },
  ];

  const stackGroups = pickCmsData(cmsGroups, fallbackGroups, (group) => ({
    title: group.category,
    description: group.description,
    items: group.items,
  }));

  return (
    <section id="skills" className="skills-section">
      <div className="container">
        <h2>{t("title")}</h2>
        <div className="skills-grid">
          {stackGroups.map((group, groupIndex) => (
            <div
              key={group.title}
              // Die Staffelung orientiert sich am Gruppenindex, damit die
              // Skill-Karten in Leserichtung nacheinander erscheinen.
              className="skill-category animate-fade-in-up"
              style={{
                animationDelay: staggeredAnimationDelay(groupIndex, 0.1),
              }}
            >
              <h3>{group.title}</h3>
              {group.description ? (
                <p className="skill-description">{group.description}</p>
              ) : null}
              <div className="skill-tags">
                {group.items.map((item) => (
                  <span key={item} className="skill-tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
