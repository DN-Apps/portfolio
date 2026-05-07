# Projekt-Dokumentation

## Projektziel

Dieses Projekt ist ein mehrsprachiges Portfolio auf Basis von Next.js 14, App Router und `next-intl`.
Es kombiniert drei Dinge:

1. serverseitig geladene Inhalte aus Directus
2. locale-basierte Routen unter `app/[locale]/...`
3. klar getrennte UI-Sections mit eigenem Styling

Neben den klassischen Inhaltsseiten gibt es inzwischen auch rechtliche Seiten für Impressum und Datenschutz sowie ein serverseitig verarbeitetes Kontaktformular mit Spam-Schutz.

## Routing und App-Struktur

Die App nutzt den Next.js App Router.
Die wichtigsten Routen liegen unter:

- `app/[locale]/about`
- `app/[locale]/projects`
- `app/[locale]/personal`
- `app/[locale]/career`
- `app/[locale]/skills`
- `app/[locale]/soft-skills`
- `app/[locale]/languages`
- `app/[locale]/contact`
- `app/[locale]/impressum`
- `app/[locale]/datenschutz`

Zusätzlich gibt es:

- `app/[locale]/layout.tsx`
  globaler Locale-Provider

- `app/[locale]/page.tsx`
  Redirect auf die About-Seite

- `app/api/contact/route.ts`
  serverseitige Kontaktverarbeitung

## Internationalisierung

Die Lokalisierung läuft über `next-intl`.

Wichtige Dateien:

- `i18n.ts`
- `middleware.ts`
- `navigation.ts`
- `messages/de.json`
- `messages/en.json`
- `messages/sr.json`
- `messages/fr.json`

Alle sichtbaren UI-Texte, Legal-Texte und Formularlabels liegen in `messages/*.json`.

## Datenfluss

### 1. Locale wird aufgelöst

Die Middleware und `i18n.ts` sorgen dafür, dass pro Request die passende Sprache gewählt wird.

### 2. Übersetzungen werden geladen

Im Locale-Layout lädt `getMessages()` die passende Sprachdatei.

### 3. Pages laden Inhalte

Die Routen unter `app/[locale]/*/page.tsx` laden ihre CMS-Daten serverseitig.

### 4. Directus-Daten werden normalisiert

`lib/directus.ts` übersetzt rohe Directus-Responses in stabile UI-Modelle.

### 5. Sections rendern Props

Die Komponenten unter `components/sections/*` konzentrieren sich auf Rendering, Darstellungslogik und UI-Zustände.

## Directus-Architektur

Die App nutzt Directus für die wichtigsten Inhaltsbereiche.

Aktive Collections:

- `hero`
- `about_card`
- `projects`
- `personal`
- `career`
- `skills`
- `soft_skills`
- `languages`
- `certificates`
- `contact`

Die zentrale Datei ist `lib/directus.ts`.
Sie übernimmt:

- Konfiguration über `NEXT_PUBLIC_DIRECTUS_URL` und optional `DIRECTUS_TOKEN`
- Locale-Filterung
- Sanitizing von Texten
- Asset-URL-Aufbereitung
- Mapping auf View-Modelle
- Fallback-Verhalten über `safeCmsFetch(...)`

## Kontaktformular

Das Kontaktformular ist nicht mehr `mailto:`-basiert.
Aktueller Stand:

- Frontend in `components/sections/ContactSection.tsx`
- API in `app/api/contact/route.ts`
- Versand per `nodemailer`
- Schutz durch Honeypot
- In-Memory Rate Limit
- optionales Cloudflare Turnstile

Relevante Umgebungsvariablen:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `CONTACT_TO_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_ENFORCE`

## Legal-Seiten

Es gibt zwei eigene Rechtstexte-Seiten:

- `app/[locale]/impressum/page.tsx`
- `app/[locale]/datenschutz/page.tsx`

Gemeinsames Styling:

- `app/[locale]/legal.css`

Die Legal-Texte liegen in den Sprachdateien unter:

- `common.legal`
- `legal.imprint`
- `legal.privacy`

Der Footer verlinkt beide Seiten global.
Das Kontaktformular enthält zusätzlich einen Datenschutz-Hinweis mit Link.

## Komponentenstruktur

Globale Komponenten:

- `components/Header.tsx`
- `components/LanguageSwitcher.tsx`
- `components/Footer.tsx`

Sections:

- `HeroSection.tsx`
- `AboutSection.tsx`
- `ProjectsSection.tsx`
- `PersonalSection.tsx`
- `CareerSection.tsx`
- `SkillsSection.tsx`
- `SoftSkillsSection.tsx`
- `LanguagesSection.tsx`
- `CertificateSection.tsx`
- `ContactSection.tsx`

Jede Section besitzt in der Regel:

- eine TSX-Datei für Rendering und UI-Logik
- eine CSS-Datei für Layout und Breakpoints

## Responsive Strategie

Die App arbeitet mit section-spezifischen Media Queries statt mit einem globalen Design-System.
Das ist pragmatisch, weil jede Section unterschiedliche Layoutprobleme hat.

Typische Schwerpunkte:

- kleine Phones
- Landscape auf kleinen Geräten
- Tablets im Querformat
- Desktop mit breiteren Rastern

Wichtig:
Bei Layout-Fehlern immer zuerst die CSS-Datei der betroffenen Section prüfen.

## Utilities und Hilfstypen

### `utils/splitPipeList.ts`

Wandelt pipe-getrennte Strings in Arrays um.
Relevant für:

- Technologien
- Highlights
- Skills
- Soft-Skill-Items

### `types/index.ts`

Enthält ältere View-Modelle für statische Strukturen.
Die aktuellen CMS-Typen liegen primär in `lib/directus.ts`.

## Wichtige technische Entscheidungen

### App Router statt Pages Router

Die App basiert vollständig auf `app/` und nicht auf `pages/`.

### Serverseitiges CMS-Laden

Die Pages holen Inhalte serverseitig statt clientseitig nachzuladen.
Das hält die Seiten robuster und besser für SEO.

### Defensive CMS-Integration

Neue Directus-Felder werden nicht automatisch sichtbar.
Das Frontend akzeptiert nur explizit gemappte Felder.
Dadurch bleibt das Rendering kontrollierbar und typisiert.

### Fallback-orientiertes Verhalten

CMS-Ausfälle sollen einzelne Sections nicht komplett unbrauchbar machen.
Deshalb wird pro Bereich mit `safeCmsFetch(...)` gearbeitet.

## Empfohlener Startpunkt für Änderungen

Wenn du eine Änderung umsetzen willst, arbeite in dieser Reihenfolge:

1. betroffene Route bestimmen
2. prüfen, ob der Inhalt aus Directus oder aus `messages/*.json` kommt
3. Mapping in `lib/directus.ts` prüfen
4. Section-Komponente anpassen
5. CSS und Breakpoints kontrollieren
6. abschließend `npm run build` ausführen

Für die operative Frage "Wo ändere ich was?" ist `DEV_QUICK_GUIDE.md` die passendere Datei.

## Fazit

Das Projekt trennt Routing, Übersetzungen, CMS-Mapping, API-Logik und UI-Sections sauber voneinander.
Dadurch bleibt das Portfolio trotz mehrsprachiger Routen, vieler Inhaltsbereiche und mehrerer Integrationen gut wartbar und kontrollierbar erweiterbar.
