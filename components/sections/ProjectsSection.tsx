"use client";

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

  const completed = projects.filter((p) => p.status === "completed");
  const inDevelopment = projects.filter((p) => p.status === "in-development");
  const planned = projects.filter((p) => p.status === "planned");

  const projectGroups = [
    { key: "completed", title: t("completed"), items: completed },
    {
      key: "in-development",
      title: t("in_development"),
      items: inDevelopment,
    },
    { key: "planned", title: t("planned"), items: planned },
  ] as const;

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

        {/* Die Kategorien bleiben bewusst getrennt, damit Projektstatus im UI
            sofort erkennbar ist und nicht erst im Karteninhalt gesucht werden muss. */}
        <div className="projects-categories">
          {projectGroups
            .filter((group) => group.items.length > 0)
            .map((group) => (
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
      </div>
    </section>
  );
}
