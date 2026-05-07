import { unstable_setRequestLocale, getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../legal.css";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function PrivacyPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("legal.privacy");

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
            <h2>{t("controller_heading")}</h2>
            <p className="legal-kv">
              <strong>{t("name_label")}: </strong>
              Daniel Nedic
            </p>
            <p className="legal-kv">
              <strong>{t("address_label")}: </strong>
              Kirchgasse 8, 74831 Gundelsheim, Germany
            </p>
            <p className="legal-kv">
              <strong>{t("email_label")}: </strong>
              daniel-nedic@hotmail.de
            </p>
          </section>

          <section className="legal-section">
            <h2>{t("processing_heading")}</h2>
            <ul className="legal-list">
              <li>{t("processing_item_1")}</li>
              <li>{t("processing_item_2")}</li>
              <li>{t("processing_item_3")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>{t("recipients_heading")}</h2>
            <p>{t("recipients_text")}</p>
          </section>

          <section className="legal-section">
            <h2>{t("retention_heading")}</h2>
            <p>{t("retention_text")}</p>
          </section>

          <section className="legal-section">
            <h2>{t("tracking_heading")}</h2>
            <p>{t("tracking_text")}</p>
          </section>

          <section className="legal-section">
            <h2>{t("rights_heading")}</h2>
            <p>{t("rights_text")}</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
