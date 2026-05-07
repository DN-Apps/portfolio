import { unstable_setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";
import SoftSkillsSection from "@/components/sections/SoftSkillsSection";
import CertificateSection from "@/components/sections/CertificateSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/Footer";
import {
  getCertificates,
  getContactContent,
  getHeroContent,
  getSoftSkillGroups,
  safeCmsFetch,
} from "@/lib/directus";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function AboutPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  // Alle CMS-Bausteine werden parallel geladen; bei Fehlern greift je Bereich ein Fallback.
  const [heroContent, softSkillGroups, certificates, contactContent] =
    await Promise.all([
      safeCmsFetch(() => getHeroContent(locale), null, "hero"),
      safeCmsFetch(() => getSoftSkillGroups(locale), [], "soft_skills"),
      safeCmsFetch(() => getCertificates(locale), [], "certificates"),
      safeCmsFetch(() => getContactContent(locale), null, "contact"),
    ]);

  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection content={heroContent} />
        <SoftSkillsSection groups={softSkillGroups} />
        <CertificateSection certificates={certificates} />
        <ContactSection content={contactContent} />
      </main>
      <Footer />
    </>
  );
}
