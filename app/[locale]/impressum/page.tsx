import { unstable_setRequestLocale, getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../legal.css";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function ImprintPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("legal.imprint");

  return (
    <>
      <Header />
      <main id="main-content" className="legal-page">
        <div className="legal-container">
          <header className="legal-header">
            <h1>{t("title")}</h1>
            <p>{t("intro")}</p>
          </header>

          <section className="legal-section">
            <h2>{t("provider_heading")}</h2>
            <p className="legal-kv">
              <strong>{t("name_label")}: </strong>
              Daniel Nedic
            </p>
            <p className="legal-kv">
              <strong>{t("address_label")}: </strong>
              Kirchgasse 8, 74831 Gundelsheim, Germany
            </p>
          </section>

          <section className="legal-section">
            <h2>{t("contact_heading")}</h2>
            <p className="legal-kv">
              <strong>{t("email_label")}: </strong>
              daniel-nedic@hotmail.de
            </p>
          </section>

          <section className="legal-section">
            <h2>{t("status_heading")}</h2>
            <p>{t("status_value")}</p>
          </section>

          <section className="legal-section">
            <h2>{t("vat_heading")}</h2>
            <p>{t("vat_value")}</p>
          </section>

          <section className="legal-section">
            <h2>{t("liability_heading")}</h2>
            <p>{t("liability_text")}</p>
          </section>

          <section className="legal-section">
            <h2>{t("copyright_heading")}</h2>
            <p>{t("copyright_text")}</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
