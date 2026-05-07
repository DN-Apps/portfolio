import { unstable_setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import ProjectsSection from "@/components/sections/ProjectsSection";
import Footer from "@/components/Footer";
import { getProjects, safeCmsFetch } from "@/lib/directus";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function ProjectsPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  // Projekte werden zentral aus dem CMS geholt; Fallback verhindert Rendering-Abbrüche.
  const projects = await safeCmsFetch(
    () => getProjects(locale),
    [],
    "projects",
  );

  return (
    <>
      <Header />
      <main id="main-content">
        <ProjectsSection projects={projects} />
      </main>
      <Footer />
    </>
  );
}
