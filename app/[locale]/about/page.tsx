import { unstable_setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import CertificateSection from "@/components/sections/CertificateSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/Footer";
import {
  getAboutCards,
  getCertificates,
  getContactContent,
  getHeroContent,
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
  const [heroContent, aboutCards, certificates, contactContent] =
    await Promise.all([
      safeCmsFetch(() => getHeroContent(locale), null, "hero"),
      safeCmsFetch(() => getAboutCards(locale), [], "about_card"),
      safeCmsFetch(() => getCertificates(locale), [], "certificates"),
      safeCmsFetch(() => getContactContent(locale), null, "contact"),
    ]);

  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection content={heroContent} />
        <AboutSection cards={aboutCards} />
        <CertificateSection certificates={certificates} />
        <ContactSection content={contactContent} />
      </main>
      <Footer />
    </>
  );
}
