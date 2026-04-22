import { unstable_setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import CareerSection from "@/components/sections/CareerSection";
import Footer from "@/components/Footer";
import { getCareerEntries, safeCmsFetch } from "@/lib/directus";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function CareerPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  // Career bleibt auch bei CMS-Problemen sichtbar, dann mit leerer Liste statt Fehlerseite.
  const experiences = await safeCmsFetch(
    () => getCareerEntries(locale),
    [],
    "career",
  );

  return (
    <>
      <Header />
      <main>
        <CareerSection experiences={experiences} />
      </main>
      <Footer />
    </>
  );
}
