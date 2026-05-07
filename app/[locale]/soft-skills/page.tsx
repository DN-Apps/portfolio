import { unstable_setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import SoftSkillsSection from "@/components/sections/SoftSkillsSection";
import Footer from "@/components/Footer";
import { getSoftSkillGroups, safeCmsFetch } from "@/lib/directus";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function SoftSkillsPage({
  params: { locale },
}: PageProps) {
  unstable_setRequestLocale(locale);
  // Soft-Skills sind CMS-gesteuert; bei Fehlern bleibt die Section über Fallback erhalten.
  const groups = await safeCmsFetch(
    () => getSoftSkillGroups(locale),
    [],
    "soft_skills",
  );

  return (
    <>
      <Header />
      <main id="main-content">
        <SoftSkillsSection groups={groups} />
      </main>
      <Footer />
    </>
  );
}
