"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { animationDelay, staggeredSeconds } from "@/utils/animationDelay";
import { splitPipeList } from "@/utils/splitPipeList";
import { pickCmsData } from "@/utils/pickCmsData";
import type { ProjectContent } from "@/lib/directus";
import "./ProjectsSection.css";

interface ProjectsSectionProps {
  projects?: ProjectContent[];
}

type LinkFilter = "all" | "with-link";

const ALL_STATUS_FILTER = "__all";

function formatStatusLabel(status: string): string {
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ProjectsSection({
  projects: cmsProjects,
}: ProjectsSectionProps) {
  const t = useTranslations("projects");

  // Projekte sind als Daten definiert, damit Kategorien, Bilder und Inhalte
  // unabhängig vom Layout gepflegt und später leicht erweitert werden können.
  const fallbackProjects: ProjectContent[] = [
    {
      id: "1",
      title: t("project_1.title"),
      description: t("project_1.description"),
      targetGroup: t("project_1.target_group"),
      functionalities: t("project_1.functionalities"),
      image: "/projects/monteurzimmer-nedic.jpg",
      status: "completed",
      technologies: ["ReactJS", "NodeJS", "Datenbankanbindung"],
    },
    {
      id: "2",
      title: t("project_2.title"),
      description: t("project_2.description"),
      targetGroup: t("project_2.target_group"),
      functionalities: t("project_2.functionalities"),
      image: "/projects/dgv.jpg",
      status: "completed",
      technologies: ["ReactJS", "NodeJS", "Datenbankanbindung"],
    },
    {
      id: "4",
      title: t("project_4.title"),
      description: t("project_4.description"),
      targetGroup: t("project_4.target_group"),
      functionalities: t("project_4.functionalities"),
      image: "/projects/application-manager.jpg",
      status: "in-development",
      technologies: ["ReactJS", "NodeJS", "Datenbankanbindung"],
    },
    {
      id: "5",
      title: t("project_5.title"),
      description: t("project_5.description"),
      targetGroup: t("project_5.target_group"),
      functionalities: t("project_5.functionalities"),
      image: "/projects/geplant.jpg",
      status: "planned",
      technologies: [
        "Service Worker",
        "Web App Manifest",
        "OpenAI",
        "Anthropic",
        "JavaScript",
        "Python",
      ],
    },
  ];

  const projects = pickCmsData(cmsProjects, fallbackProjects);
  const [selectedStatus, setSelectedStatus] = useState<string>(ALL_STATUS_FILTER);
  const [selectedLinkFilter, setSelectedLinkFilter] =
    useState<LinkFilter>("all");

  const statusLabels = useMemo(
    () => ({
      completed: t("completed"),
      "in-development": t("in_development"),
      planned: t("planned"),
    }),
    [t],
  );

  const availableStatuses = useMemo(
    () => Array.from(new Set(projects.map((project) => project.status))),
    [projects],
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesStatus =
          selectedStatus === ALL_STATUS_FILTER || project.status === selectedStatus;
        const hasLink = Boolean(project.link?.trim());
        const matchesLink =
          selectedLinkFilter === "all" ||
          (selectedLinkFilter === "with-link" && hasLink);

        return matchesStatus && matchesLink;
      }),
    [projects, selectedStatus, selectedLinkFilter],
  );

  const projectGroups = useMemo(
    () =>
      availableStatuses
        .map((status) => ({
          key: status,
          title: statusLabels[status as keyof typeof statusLabels] ?? formatStatusLabel(status),
          items: filteredProjects.filter((project) => project.status === status),
        }))
        .filter((group) => group.items.length > 0),
    [availableStatuses, filteredProjects, statusLabels],
  );

  // Die Kartenkomponente bleibt lokal, weil sie nur in dieser Section benutzt
  // wird und eng an die Projektstruktur gekoppelt ist.
  const ProjectCard = ({
    project,
    delay,
  }: {
    project: ProjectContent;
    delay: number;
  }) => (
    <div
      className="project-card animate-fade-in-up"
      style={{ animationDelay: animationDelay(delay) }}
    >
      {project.image ? (
        <div className="project-image-wrap">
          <Image
            src={project.image}
            alt={project.title}
            width={800}
            height={450}
            className="project-image"
          />
        </div>
      ) : null}
      <h3>{project.title}</h3>
      <p className="project-description">{project.description}</p>
      {project.link ? (
        <a
          className="project-link-button"
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("open_project")}
        </a>
      ) : null}
      {project.targetGroup ? (
        <div className="project-meta-block">
          <p className="project-meta">
            <strong>{t("target_group_label")}:</strong>
          </p>
          <div className="project-target-groups">
            {splitPipeList(project.targetGroup).map((targetGroupItem) => (
              <span key={targetGroupItem} className="project-target-group-tag">
                {targetGroupItem}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {project.functionalities ? (
        <div className="project-meta-block">
          <p className="project-meta">
            <strong>{t("functionalities_label")}:</strong>
          </p>
          <div className="project-features">
            {splitPipeList(project.functionalities).map((feature) => (
              <span key={feature} className="project-feature-tag">
                {feature}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <div className="technologies">
        {(project.technologies ?? []).map((tech) => (
          <span key={tech} className="tech-tag">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <h2>{t("title")}</h2>

        <div className="projects-filters" aria-label={t("filters_title")}>
          <div className="project-filter-field">
            <div className="project-filter-options" aria-label={t("filter_status_label")}>
              {availableStatuses.map((status) => {
                const statusLabel =
                  statusLabels[status as keyof typeof statusLabels] ??
                  formatStatusLabel(status);
                const isSelected = selectedStatus === status;

                return (
                  <button
                    key={status}
                    type="button"
                    className={`project-filter-pill${isSelected ? " is-disabled" : ""}`}
                    onClick={() => setSelectedStatus(status)}
                    disabled={isSelected}
                  >
                    {statusLabel}
                  </button>
                );
              })}
            </div>
            <p className="project-filter-label">{t("filter_status_label")}</p>
            <div className="project-filter-active-area">
              {selectedStatus !== ALL_STATUS_FILTER ? (
                <button
                  type="button"
                  className="project-filter-active-pill"
                  onClick={() => setSelectedStatus(ALL_STATUS_FILTER)}
                >
                  {statusLabels[selectedStatus as keyof typeof statusLabels] ??
                    formatStatusLabel(selectedStatus)}
                  <span className="project-filter-remove">×</span>
                </button>
              ) : (
                <div className="project-filter-empty-space" aria-hidden="true" />
              )}
            </div>
          </div>

          <div className="project-filter-field">
            <div className="project-filter-options" aria-label={t("filter_link_label")}>
              <button
                type="button"
                className={`project-filter-pill${selectedLinkFilter === "with-link" ? " is-disabled" : ""}`}
                onClick={() => setSelectedLinkFilter("with-link")}
                disabled={selectedLinkFilter === "with-link"}
              >
                {t("filter_link_with")}
              </button>
            </div>
            <p className="project-filter-label">{t("filter_link_label")}</p>
            <div className="project-filter-active-area">
              {selectedLinkFilter === "with-link" ? (
                <button
                  type="button"
                  className="project-filter-active-pill"
                  onClick={() => setSelectedLinkFilter("all")}
                >
                  {t("filter_link_with")}
                  <span className="project-filter-remove">×</span>
                </button>
              ) : (
                <div className="project-filter-empty-space" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        {/* Die Kategorien bleiben bewusst getrennt, damit Projektstatus im UI
            sofort erkennbar ist und nicht erst im Karteninhalt gesucht werden muss. */}
        <div className="projects-categories">
          {projectGroups.map((group) => (
            <div key={group.key} className="projects-category">
              <h3>{group.title}</h3>
              <div className="projects-grid">
                {group.items.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    delay={staggeredSeconds(index, 0.1)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {projectGroups.length === 0 ? (
          <p className="projects-empty">{t("no_results")}</p>
        ) : null}
      </div>
    </section>
  );
}
