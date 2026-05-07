# Portfolio Docs Index

Diese Dokumentation beschreibt den aktuellen Stand des Portfolios.
Die App ist eine mehrsprachige Next.js-14-Anwendung mit App Router, `next-intl`, Directus-Anbindung und serverseitigem Kontaktformular.

## Inhalt dieses Ordners

- `QUICKSTART.md`
  Schnellstart für lokale Entwicklung, Environment und Build

- `PROJECT_DOCUMENTATION.md`
  Architektur, Datenfluss und aktuelle Projektstruktur

- `DEV_QUICK_GUIDE.md`
  Schnelle Orientierung: Wo ändere ich was?

- `DIRECTUS_INTEGRATION.md`
  Directus-Collections, Mapping und CMS-Ablauf

- `FEATURE_CHANGE_CHECKLIST.md`
  Arbeitscheckliste für typische Änderungen

- `TEMP_CREATE_TEST.md`
  Temporäre interne Notizdatei ohne fachliche Relevanz

## Aktueller Funktionsumfang

- locale-basiertes Routing unter `app/[locale]/...`
- Sprachen: `de`, `en`, `sr`, `fr`
- Inhalte aus Directus für die Hauptsections
- serverseitige Kontakt-API mit `nodemailer`
- Spam-Schutz über Honeypot, Rate Limit und optional Turnstile
- eigene Legal-Seiten für Impressum und Datenschutz

## Wichtige technische Eckpunkte

- Framework: Next.js 14
- Router: App Router
- Sprache: TypeScript
- i18n: `next-intl`
- CMS: Directus
- Mailversand: `nodemailer`

## Schnellnavigation im Code

- `app/[locale]/layout.tsx`
  globaler Locale-Kontext

- `lib/directus.ts`
  CMS-Fetching und Mapping

- `app/api/contact/route.ts`
  Kontakt-Endpoint

- `components/sections/*`
  UI-Sections

- `messages/*.json`
  Übersetzungen und Legal-Texte

## Hinweise

- Einige ältere Doku-Dateien beschrieben noch statische Section-Daten und ein `mailto:`-Formular. Das ist nicht mehr aktuell.
- Neue Directus-Felder werden nicht automatisch sichtbar, sondern müssen in `lib/directus.ts` und in den betroffenen Sections explizit integriert werden.
