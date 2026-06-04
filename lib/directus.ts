import { splitPipeList } from "@/utils/splitPipeList";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL?.replace(/\/$/, "");
const directusToken = process.env.DIRECTUS_TOKEN;

export const hasDirectusConfig = Boolean(directusUrl);

type QueryParams = Record<string, string | number | boolean>;

const SAFE_LOCALE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]+)?$/i;

function requireDirectusUrl() {
  if (!directusUrl) {
    throw new Error(
      "Missing environment variable NEXT_PUBLIC_DIRECTUS_URL. Add it to .env.local",
    );
  }

  return directusUrl;
}

function buildQueryString(params: QueryParams) {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
}

function queryWithLocale(
  locale?: string,
  query: QueryParams = {},
): QueryParams {
  const normalizedLocale = sanitizeLocale(locale);

  if (!normalizedLocale) {
    return query;
  }

  return {
    ...query,
    "filter[locale][_eq]": normalizedLocale,
  };
}

function sanitizeLocale(value?: string): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed || !SAFE_LOCALE_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function sanitizeText(value: unknown): string {
  // Entfernt Steuerzeichen zentral, damit CMS- und Formulartexte konsistent bereinigt werden.
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function sanitizeOptionalText(value: unknown): string | undefined {
  const sanitized = sanitizeText(value);
  return sanitized.length > 0 ? sanitized : undefined;
}

function isSafeAssetUrl(value: string): boolean {
  if (value.startsWith("/")) {
    return !value.startsWith("//");
  }

  return /^https?:\/\//i.test(value);
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeText(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return splitPipeList(value)
      .map((item) => sanitizeText(item))
      .filter(Boolean);
  }

  return [];
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function getDirectusAssetUrl(value: unknown): string | undefined {
  // Akzeptiert sichere URLs oder wandelt Directus-Datei-IDs in /assets-URLs um.
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    if (isSafeAssetUrl(value)) {
      return value;
    }

    if (!hasDirectusConfig) {
      return undefined;
    }

    return `${requireDirectusUrl()}/assets/${encodeURIComponent(value)}`;
  }

  if (value && typeof value === "object") {
    const file = value as Record<string, unknown>;

    if (typeof file.url === "string" && isSafeAssetUrl(file.url)) {
      return file.url;
    }

    if (typeof file.id === "string") {
      if (!hasDirectusConfig) {
        return undefined;
      }

      return `${requireDirectusUrl()}/assets/${encodeURIComponent(file.id)}`;
    }
  }

  return undefined;
}

async function directusFetch<T>(path: string, query: QueryParams = {}) {
  const queryString = buildQueryString(query);
  const url = `${requireDirectusUrl()}/${path}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: {
      ...(directusToken ? { Authorization: `Bearer ${directusToken}` } : {}),
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Directus fetch failed: ${response.status} ${response.statusText} - ${body}`,
    );
  }

  return (await response.json()) as T;
}

export type DirectusCollectionResponse<T> = {
  data: T[];
  meta?: {
    filter_count?: number;
    total_count?: number;
    page?: number;
    page_count?: number;
    per_page?: number;
  };
};

export async function fetchDirectusCollection<T>(
  collectionName: string,
  query: QueryParams = {},
) {
  // Kapselt den Standardzugriff auf Directus-Collections in einem einheitlichen Rückgabeformat.
  return directusFetch<DirectusCollectionResponse<T>>(
    `items/${collectionName}`,
    query,
  );
}

export async function fetchDirectusItem<T>(
  collectionName: string,
  itemId: string | number,
) {
  // Holt ein einzelnes Collection-Item, z. B. für Detailansichten oder Debugging.
  return directusFetch<{ data: T }>(`items/${collectionName}/${itemId}`);
}

async function fetchFirstCollectionItem<T>(
  collectionName: string,
  locale?: string,
): Promise<T | null> {
  const result = await fetchDirectusCollection<T>(
    collectionName,
    queryWithLocale(locale, { sort: "sort,id", limit: 1 }),
  );

  return result.data[0] ?? null;
}

export type DirectusProject = {
  id: number | string;
  title: string;
  description: string;
  target_group?: string;
  functionalities?: string;
  link?: string;
  image?: string | Record<string, unknown>;
  status?: string;
  technologies?: string[] | string;
  locale?: string;
  sort?: number;
};

export type ProjectContent = {
  id: string;
  title: string;
  description: string;
  targetGroup?: string;
  functionalities?: string;
  link?: string;
  image?: string;
  status: "completed" | "in-development" | "planned";
  technologies: string[];
};

export async function getProjects(locale?: string): Promise<ProjectContent[]> {
  // Normalisiert Projektdaten inklusive Status und Technologien auf das UI-Format.
  const result = await fetchDirectusCollection<DirectusProject>(
    "projects",
    queryWithLocale(locale, { sort: "sort,id" }),
  );

  return result.data.map((item) => {
    const normalizedStatus =
      item.status === "completed" ||
      item.status === "in-development" ||
      item.status === "planned"
        ? item.status
        : "planned";

    return {
      id: String(item.id),
      title: sanitizeText(item.title),
      description: sanitizeText(item.description),
      targetGroup: sanitizeOptionalText(item.target_group),
      functionalities: sanitizeOptionalText(item.functionalities),
      link: sanitizeOptionalText(item.link),
      image: getDirectusAssetUrl(item.image),
      status: normalizedStatus,
      technologies: toStringArray(item.technologies),
    };
  });
}

export type DirectusPersonalCard = {
  id: number | string;
  title: string;
  description: string;
  target?: string;
  why?: string;
  details?: string;
  image?: string | Record<string, unknown>;
  locale?: string;
  sort?: number;
};

export type PersonalCardContent = {
  id: string;
  title: string;
  description: string;
  target?: string;
  why?: string;
  details?: string;
  imageSrc?: string;
};

export async function getPersonalCards(
  locale?: string,
): Promise<PersonalCardContent[]> {
  // Wandelt die persönliche CMS-Collection in die Kartenstruktur der Section um.
  const result = await fetchDirectusCollection<DirectusPersonalCard>(
    "personal",
    queryWithLocale(locale, { sort: "sort,id" }),
  );

  return result.data.map((item) => ({
    id: String(item.id),
    title: sanitizeText(item.title),
    description: sanitizeText(item.description),
    target: sanitizeOptionalText(item.target),
    why: sanitizeOptionalText(item.why),
    details: sanitizeOptionalText(item.details),
    imageSrc: getDirectusAssetUrl(item.image),
  }));
}

export type DirectusHeroContent = {
  id: number | string;
  greeting: string;
  name: string;
  passion: string;
  languages_intro: string;
  closing: string;
  tech_skills: string;
  brings_list: string;
  focus_list: string;
  portrait?: string | Record<string, unknown>;
  locale?: string;
  sort?: number;
};

export type HeroContent = Omit<DirectusHeroContent, "id" | "portrait"> & {
  portrait?: string;
};

export async function getHeroContent(
  locale?: string,
): Promise<HeroContent | null> {
  // Hero nutzt bewusst nur den ersten passenden Datensatz pro Locale.
  const firstItem = await fetchFirstCollectionItem<DirectusHeroContent>(
    "hero",
    locale,
  );

  if (!firstItem) {
    return null;
  }

  const { id: _id, sort: _sort, ...content } = firstItem;

  return {
    greeting: sanitizeText(content.greeting),
    name: sanitizeText(content.name),
    passion: sanitizeText(content.passion),
    languages_intro: sanitizeText(content.languages_intro),
    closing: sanitizeText(content.closing),
    tech_skills: sanitizeText(content.tech_skills),
    brings_list: sanitizeText(content.brings_list),
    focus_list: sanitizeText(content.focus_list),
    portrait: getDirectusAssetUrl(content.portrait),
    locale: sanitizeOptionalText(content.locale),
  };
}

export type DirectusAboutCard = {
  id: number | string;
  title: string;
  icon?: string;
  description: string;
  locale?: string;
  sort?: number;
};

export type AboutCardContent = {
  id: string;
  title: string;
  icon: string;
  description: string;
};

export async function getAboutCards(
  locale?: string,
): Promise<AboutCardContent[]> {
  // About-Karten werden sortiert geladen und auf sichere Textwerte reduziert.
  const result = await fetchDirectusCollection<DirectusAboutCard>(
    "about_card",
    queryWithLocale(locale, { sort: "sort,id" }),
  );

  return result.data.map((item) => ({
    id: String(item.id),
    title: sanitizeText(item.title),
    icon: sanitizeOptionalText(item.icon) ?? "•",
    description: sanitizeText(item.description),
  }));
}

export type DirectusCareerEntry = {
  id: number | string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
  highlights?: string | string[];
  current?: boolean;
  locale?: string;
  sort?: number;
};

export type CareerContent = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  highlights: string[];
  current: boolean;
};

export async function getCareerEntries(
  locale?: string,
): Promise<CareerContent[]> {
  // Werdegang wird absichtlich absteigend sortiert (neueste Station zuerst).
  const result = await fetchDirectusCollection<DirectusCareerEntry>(
    "career",
    queryWithLocale(locale, { sort: "-sort,-id" }),
  );

  return result.data.map((item) => ({
    id: String(item.id),
    company: sanitizeText(item.company),
    position: sanitizeText(item.position),
    startDate: sanitizeText(item.start_date),
    endDate: sanitizeOptionalText(item.end_date),
    description: sanitizeText(item.description),
    highlights: toStringArray(item.highlights),
    current: Boolean(item.current),
  }));
}

export type DirectusSkillGroup = {
  id: number | string;
  category: string;
  description?: string;
  items: string | string[];
  locale?: string;
  sort?: number;
};

export type SkillGroupContent = {
  id: string;
  category: string;
  description?: string;
  items: string[];
};

export async function getSkillGroups(
  locale?: string,
): Promise<SkillGroupContent[]> {
  // Tech-Skills werden als Kategorie plus Item-Liste für Tag-Rendering bereitgestellt.
  const result = await fetchDirectusCollection<DirectusSkillGroup>(
    "skills",
    queryWithLocale(locale, { sort: "sort,id" }),
  );

  return result.data.map((item) => ({
    id: String(item.id),
    category: sanitizeText(item.category),
    description: sanitizeOptionalText(item.description),
    items: toStringArray(item.items),
  }));
}

export type DirectusSoftSkillGroup = {
  id: number | string;
  title: string;
  items: string | string[];
  icon?: string;
  locale?: string;
  sort?: number;
};

export type SoftSkillGroupContent = {
  id: string;
  title: string;
  items: string[];
  icon?: string;
};

export async function getSoftSkillGroups(
  locale?: string,
): Promise<SoftSkillGroupContent[]> {
  // Soft-Skills spiegeln Titel, Item-Liste und optionales Icon aus dem CMS.
  const result = await fetchDirectusCollection<DirectusSoftSkillGroup>(
    "soft_skills",
    queryWithLocale(locale, { sort: "sort,id" }),
  );

  return result.data.map((item) => ({
    id: String(item.id),
    title: sanitizeText(item.title),
    items: toStringArray(item.items),
    icon: sanitizeOptionalText(item.icon),
  }));
}

export type DirectusLanguage = {
  id: number | string;
  name: string;
  proficiency: number | string;
  locale?: string;
  sort?: number;
};

export type LanguageContent = {
  id: string;
  name: string;
  proficiency: number;
};

export async function getLanguages(
  locale?: string,
): Promise<LanguageContent[]> {
  // Sprachwerte werden numerisch normalisiert, damit Prozentbalken stabil bleiben.
  const result = await fetchDirectusCollection<DirectusLanguage>(
    "languages",
    queryWithLocale(locale, { sort: "sort,id" }),
  );

  return result.data.map((item) => ({
    id: String(item.id),
    name: sanitizeText(item.name),
    proficiency: toNumber(item.proficiency),
  }));
}

export type DirectusCertificate = {
  id: number | string;
  title: string;
  subtitle?: string;
  file: string | Record<string, unknown>;
  year?: string;
  locale?: string;
  sort?: number;
};

export type CertificateContent = {
  id: string;
  title: string;
  subtitle?: string;
  file: string;
  year?: string;
};

export async function getCertificates(
  locale?: string,
): Promise<CertificateContent[]> {
  // Zertifikate ohne gültige Datei-URL werden bewusst ausgefiltert.
  const result = await fetchDirectusCollection<DirectusCertificate>(
    "certificates",
    queryWithLocale(locale, { sort: "sort,id" }),
  );

  return result.data.flatMap((item) => {
    const file = getDirectusAssetUrl(item.file);

    if (!file) {
      return [];
    }

    return [
      {
        id: String(item.id),
        title: sanitizeText(item.title),
        subtitle: sanitizeOptionalText(item.subtitle),
        file,
        year: sanitizeOptionalText(item.year),
      },
    ];
  });
}

export type DirectusContact = {
  id: number | string;
  title?: string;
  description?: string;
  name_label?: string;
  email_label?: string;
  subject_label?: string;
  message_label?: string;
  submit?: string;
  locale?: string;
  sort?: number;
};

export type ContactContent = {
  title?: string;
  description?: string;
  nameLabel?: string;
  emailLabel?: string;
  subjectLabel?: string;
  messageLabel?: string;
  submitLabel?: string;
};

export async function getContactContent(
  locale?: string,
): Promise<ContactContent | null> {
  // Kontakttexte werden optional geladen; das Formular funktioniert auch ohne CMS-Texte.
  const item = await fetchFirstCollectionItem<DirectusContact>(
    "contact",
    locale,
  );

  if (!item) {
    return null;
  }

  return {
    title: sanitizeOptionalText(item.title),
    description: sanitizeOptionalText(item.description),
    nameLabel: sanitizeOptionalText(item.name_label),
    emailLabel: sanitizeOptionalText(item.email_label),
    subjectLabel: sanitizeOptionalText(item.subject_label),
    messageLabel: sanitizeOptionalText(item.message_label),
    submitLabel: sanitizeOptionalText(item.submit),
  };
}

export async function safeCmsFetch<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  sectionName: string,
): Promise<T> {
  // Schirmt jede Section gegen CMS-Ausfälle ab und liefert den definierten Fallback.
  try {
    return await fetcher();
  } catch (error) {
    console.error(`[Directus] ${sectionName} fallback enabled`, error);
    return fallback;
  }
}
