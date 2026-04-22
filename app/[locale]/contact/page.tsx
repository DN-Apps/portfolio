import { unstable_setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/Footer";
import { getContactContent, safeCmsFetch } from "@/lib/directus";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function ContactPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  // Formulartexte kommen aus dem CMS, fallen bei Ausfall auf die Locale-Datei zurück.
  const contactContent = await safeCmsFetch(
    () => getContactContent(locale),
    null,
    "contact",
  );

  return (
    <>
      <Header />
      <main>
        <ContactSection content={contactContent} />
      </main>
      <Footer />
    </>
  );
}
