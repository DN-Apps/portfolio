"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import "./Header.css";

// Die Navigation ist bewusst statisch am Modulrand definiert, damit sie nicht
// bei jedem Render neu erzeugt wird.
const navItems = [
  { key: "about", path: "about" },
  { key: "projects", path: "projects" },
  { key: "personal", path: "personal" },
  { key: "career", path: "career" },
  { key: "skills", path: "skills" },
  { key: "languages", path: "languages" },
  { key: "contact", path: "contact" },
] as const;

const normalizePath = (path: string) =>
  path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;

export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common.nav");
  const [menuOpen, setMenuOpen] = useState(false);

  // Trailing-Slashes werden vereinheitlicht, damit die Aktiv-Markierung auch
  // dann stimmt, wenn Next unterschiedliche URL-Formen liefert.
  const currentPath = normalizePath(pathname);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>Ned-IT</h1>
          <button
            className={`burger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Schließen" : "Menü öffnen"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          {navItems.map((item) => {
            const href = `/${item.path}`;
            const isActive = currentPath === normalizePath(href);

            return (
              // Beim Klick wird das Mobile-Menü direkt geschlossen, weil sonst
              // nach dem Routing ein offener Zustand stehen bleiben würde.
              <Link
                key={item.key}
                href={href}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="language-switcher-wrapper">
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}
