import { getLocale, getTranslations } from "next-intl/server";
import {
  getFooterSocialLinks,
  safeCmsFetch,
  type SocialLinkContent,
} from "@/lib/directus";
import { Link } from "@/navigation";
import "./Footer.css";

const fallbackSocialLinks: SocialLinkContent[] = [
  {
    id: "github",
    label: "GitHub",
    url: "https://github.com/DN-Apps",
  },
  {
    id: "xing",
    label: "Xing",
    url: "https://www.xing.com/profile/Daniel_Nedic",
  },
];

export default async function Footer() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("common")]);

  const socialLinks = await safeCmsFetch(
    () => getFooterSocialLinks(locale),
    fallbackSocialLinks,
    "social_links",
  );

  // Das Jahr wird dynamisch gelesen, damit der Footer nicht manuell gepflegt
  // werden muss.
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>{t("name")}</h3>
            <p>{t("title")}</p>
          </div>

          <div className="footer-links">
            <h4>{t("footer.links_title")}</h4>
            <ul>
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/contact">{t("nav.contact")}</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>{t("footer.legal_title")}</h4>
            <ul>
              <li>
                <Link href="/impressum">{t("legal.imprint")}</Link>
              </li>
              <li>
                <Link href="/datenschutz">{t("legal.privacy")}</Link>
              </li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>{t("footer.contact_title")}</h4>
            <p>Email: daniel-nedic@hotmail.de</p>
            <p>Location: Germany</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {currentYear} {t("name")}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
