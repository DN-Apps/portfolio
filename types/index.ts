// Legacy-View-Modelle für statische Inhalte; CMS-Modelle liegen in lib/directus.ts.
export interface Project {
  id: string;
  titleKey: string;
  descriptionKey: string;
  technologies: string[];
  status: "completed" | "in-development" | "planned";
  image?: string;
  link?: string;
  github?: string;
}

export interface Skill {
  id: string;
  nameKey: string;
  level: number; // 1-5
  category: "frontend" | "backend" | "tools" | "other";
}

export interface Experience {
  id: string;
  companyKey: string;
  positionKey: string;
  startDate: string;
  endDate?: string;
  descriptionKey: string;
  current: boolean;
}

export interface SoftSkill {
  id: string;
  nameKey: string;
  descriptionKey: string;
  proficiency: number; // 1-5
}

export interface LanguageProficiency {
  language: string;
  proficiency: number; // percentage 0-100
}

export interface PersonalInfo {
  titleKey: string;
  descriptionKey: string;
  hobbiesKey: string;
  quote?: string;
}
