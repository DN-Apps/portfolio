import { unstable_setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import SkillsSection from "@/components/sections/SkillsSection";
import SoftSkillsSection from "@/components/sections/SoftSkillsSection";
import Footer from "@/components/Footer";
import {
  getSkillGroups,
  getSoftSkillGroups,
  safeCmsFetch,
} from "@/lib/directus";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function SkillsPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  // Beide Skill-Bereiche laden parallel, damit die Seite mit einem Request-Block aufgebaut wird.
  const [groups, softSkillGroups] = await Promise.all([
    safeCmsFetch(() => getSkillGroups(locale), [], "skills"),
    safeCmsFetch(() => getSoftSkillGroups(locale), [], "soft_skills"),
  ]);

  return (
    <>
      <Header />
      <main>
        <SkillsSection groups={groups} />
        <SoftSkillsSection groups={softSkillGroups} />
      </main>
      <Footer />
    </>
  );
}
