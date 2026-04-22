import { unstable_setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import LanguagesSection from "@/components/sections/LanguagesSection";
import Footer from "@/components/Footer";
import { getLanguages, safeCmsFetch } from "@/lib/directus";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function LanguagesPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  // Sprachdaten werden CMS-first geladen, damit Änderungen ohne Deploy sichtbar sind.
  const items = await safeCmsFetch(() => getLanguages(locale), [], "languages");

  return (
    <>
      <Header />
      <main>
        <LanguagesSection items={items} />
      </main>
      <Footer />
    </>
  );
}
