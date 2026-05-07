"use client";

import { useTranslations } from "next-intl";
import { staggeredAnimationDelay } from "@/utils/animationDelay";
import { splitPipeList } from "@/utils/splitPipeList";
import { pickCmsData } from "@/utils/pickCmsData";
import type { SoftSkillGroupContent } from "@/lib/directus";
import "./SoftSkillsSection.css";

interface SoftSkillsSectionProps {
  groups?: SoftSkillGroupContent[];
}

export default function SoftSkillsSection({
  groups: cmsGroups,
}: SoftSkillsSectionProps) {
  const t = useTranslations("soft_skills");

  const iconTokenMap: Record<string, string> = {
    build: "🏗️",
    architecture: "🏗️",
    settings_suggest: "⚙️",
    settings: "⚙️",
    agile: "⚙️",
    rocket_launch: "🚀",
    rocket: "🚀",
    devops: "🚀",
  };

  function inferSoftSkillIcon(title: string, index: number): string {
    const normalized = title.toLowerCase();

    if (
      normalized.includes("architekt") ||
      normalized.includes("engineering")
    ) {
      return "🏗️";
    }

    if (normalized.includes("agile") || normalized.includes("scrum")) {
      return "⚙️";
    }

    if (normalized.includes("devops") || normalized.includes("betrieb")) {
      return "🚀";
    }

    // Falls Titel umbenannt wurden, bleibt die ursprüngliche visuelle Reihenfolge stabil.
    return softSkills[index]?.icon ?? "•";
  }

  function resolveSoftSkillIcon(
    iconValue: string | undefined,
    title: string,
    index: number,
  ): string {
    const normalizedIcon = iconValue?.trim().toLowerCase();

    if (normalizedIcon) {
      return iconTokenMap[normalizedIcon] ?? iconValue!;
    }

    return inferSoftSkillIcon(title, index);
  }

  // Soft Skills sind absichtlich in Themenblöcke gruppiert, weil einzelne
  // Stichpunkte ohne Kontext zu beliebig wirken würden.
  const softSkills = [
    {
      title: t("architecture.title"),
      items: splitPipeList(t("architecture.items")),
      icon: "🏗️",
    },
    {
      title: t("agile.title"),
      items: splitPipeList(t("agile.items")),
      icon: "⚙️",
    },
    {
      title: t("devops.title"),
      items: splitPipeList(t("devops.items")),
      icon: "🚀",
    },
  ];

  const groups = pickCmsData(cmsGroups, softSkills, (group) => ({
    title: group.title,
    items: group.items,
    icon: group.icon,
  })).map((group, index) => ({
    ...group,
    icon: resolveSoftSkillIcon(group.icon, group.title, index),
  }));

  return (
    <section className="soft-skills-section">
      <div className="container">
        <h2>{t("title")}</h2>
        <div className="soft-skills-grid">
          {groups.map((skill, index) => (
            <div
              key={skill.title}
              // Jede Karte nutzt dieselbe Struktur; Icon, Titel und Liste sind
              // deshalb reine Daten statt separater JSX-Blöcke.
              className="soft-skill-card animate-fade-in-up"
              style={{ animationDelay: staggeredAnimationDelay(index, 0.2) }}
            >
              <div className="skill-icon">{skill.icon}</div>
              <h3>{skill.title}</h3>
              <ul className="soft-skill-list">
                {skill.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
