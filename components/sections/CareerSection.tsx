"use client";

import { useTranslations } from "next-intl";
import { staggeredAnimationDelay } from "@/utils/animationDelay";
import { splitPipeList } from "@/utils/splitPipeList";
import { pickCmsData } from "@/utils/pickCmsData";
import type { CareerContent } from "@/lib/directus";
import "./CareerSection.css";

interface CareerSectionProps {
  experiences?: CareerContent[];
}

export default function CareerSection({
  experiences: cmsExperiences,
}: CareerSectionProps) {
  const t = useTranslations("career");

  // Die Timeline wird bewusst als sortierte Datenliste definiert. So bleibt
  // die Reihenfolge kontrollierbar, auch wenn Texte aus Übersetzungen kommen.
  const fallbackExperiences: CareerContent[] = [
    {
      id: "6",
      company: t("experience_6.company"),
      position: t("experience_6.position"),
      startDate: t("experience_6.start_date"),
      endDate: t("experience_6.end_date"),
      description: t("experience_6.description"),
      highlights: splitPipeList(t("experience_6.highlights")),
      current: false,
    },
    {
      id: "5",
      company: t("experience_5.company"),
      position: t("experience_5.position"),
      startDate: t("experience_5.start_date"),
      endDate: t("experience_5.end_date"),
      description: t("experience_5.description"),
      highlights: splitPipeList(t("experience_5.highlights")),
      current: false,
    },
    {
      id: "4",
      company: t("experience_4.company"),
      position: t("experience_4.position"),
      startDate: t("experience_4.start_date"),
      endDate: t("experience_4.end_date"),
      description: t("experience_4.description"),
      highlights: splitPipeList(t("experience_4.highlights")),
      current: false,
    },
    {
      id: "0",
      company: t("experience_0.company"),
      position: t("experience_0.position"),
      startDate: t("experience_0.start_date"),
      endDate: t("experience_0.end_date"),
      description: t("experience_0.description"),
      highlights: [],
      current: false,
    },
  ];

  const experiences = pickCmsData(cmsExperiences, fallbackExperiences);

  return (
    <section id="career" className="career-section">
      <div className="container">
        <h2>{t("title")}</h2>
        <div className="timeline">
          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              // Der Zustand "current" steuert Styling und Marker, damit eine
              // laufende Position visuell hervorgehoben werden könnte.
              className={`timeline-item ${exp.current ? "current" : ""} animate-fade-in-up`}
              style={{ animationDelay: staggeredAnimationDelay(index, 0.2) }}
            >
              <div className="timeline-marker">
                {exp.current && <div className="active-indicator"></div>}
              </div>
              <div className="timeline-content">
                <h3>{exp.position}</h3>
                <p className="company">{exp.company}</p>
                <p className="date">
                  {exp.startDate} - {exp.endDate}
                </p>
                <p className="description">{exp.description}</p>
                {/* Highlights bleiben optional, weil nicht jede Station eine
                    zweite inhaltliche Ebene braucht. */}
                {exp.highlights.length > 0 ? (
                  <ul className="description-list">
                    {exp.highlights.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
