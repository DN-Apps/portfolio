import { unstable_setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import PersonalSection from "@/components/sections/PersonalSection";
import Footer from "@/components/Footer";
import { getPersonalCards, safeCmsFetch } from "@/lib/directus";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function PersonalPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  // Persönliche Karten bleiben stabil, selbst wenn Directus temporär nicht erreichbar ist.
  const cards = await safeCmsFetch(
    () => getPersonalCards(locale),
    [],
    "personal",
  );

  return (
    <>
      <Header />
      <main id="main-content">
        <PersonalSection cards={cards} />
      </main>
      <Footer />
    </>
  );
}
