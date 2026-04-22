"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import "./Footer.css";

export default function Footer() {
  const t = useTranslations("common");
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
              <li>
                <a
                  href="https://github.com/DN-Apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.xing.com/profile/Daniel_Nedic"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xing
                </a>
              </li>
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
