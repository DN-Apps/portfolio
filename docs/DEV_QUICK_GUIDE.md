# Entwickler-Kurzübersicht

## Zweck

Diese Datei ist die schnellste Orientierung für Änderungen im Projekt.
Für die ausführlichere Beschreibung siehe zusätzlich:

- `PROJECT_DOCUMENTATION.md`
- `DIRECTUS_INTEGRATION.md`

## Einstieg in 30 Sekunden

Die wichtigsten Startpunkte sind:

1. `app/[locale]/layout.tsx`
   Globales Locale-Layout mit `NextIntlClientProvider`

2. `app/[locale]/*/page.tsx`
   Server Pages pro Route, inklusive Datenladen aus Directus

3. `lib/directus.ts`
   Directus-Fetching, Mapping, Fallback-Strategie und Asset-URLs

4. `components/sections/*`
   Rendering der Inhaltsbereiche

5. `messages/*.json`
   UI-Texte, Labels und Legal-Texte

## Wo ändere ich was?

### Texte ändern

Für normale UI-Texte und Labels:

- `messages/de.json`
- `messages/en.json`
- `messages/sr.json`
- `messages/fr.json`

Wichtig:
Die meisten sichtbaren Texte liegen nicht in TSX-Dateien, sondern in `messages/*.json`.

### CMS-Daten ändern

Wenn Inhalte aus Directus kommen, ist meist relevant:

- Collection in Directus
- Mapping in `lib/directus.ts`
- Rendering in der passenden Section-Komponente

Betroffene Collections:

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

### Neue Felder aus Directus nutzen

Ein neues Feld in Directus landet nicht automatisch sichtbar in der App.
Du musst in der Regel drei Stellen anpassen:

1. Typ/Mappings in `lib/directus.ts`
2. View-Props oder UI-Logik in der passenden Section
3. optional Texte/Labels in `messages/*.json`

### Navigation ändern

Menüpunkte:

- `components/Header.tsx`

Footer-Links und Rechtliches:

- `components/Footer.tsx`

Darstellung:

- `components/Header.css`
- `components/Footer.css`

### Sprachumschalter ändern

Logik und Metadaten:

- `components/LanguageSwitcher.tsx`

Darstellung:

- `components/LanguageSwitcher.css`

Neue Locale:

- `i18n.ts`
- `messages/<locale>.json`

### Kontaktformular ändern

Frontend:

- `components/sections/ContactSection.tsx`
- `components/sections/ContactSection.css`

Backend:

- `app/api/contact/route.ts`

Environment:

- `.env.local`
- `.env.example`

### Impressum und Datenschutzhinweis ändern

Routen:

- `app/[locale]/impressum/page.tsx`
- `app/[locale]/datenschutz/page.tsx`

Gemeinsames Styling:

- `app/[locale]/legal.css`

Texte:

- `messages/*.json` unter `common.legal`, `legal.imprint`, `legal.privacy`

## Wie die Daten organisiert sind

### Übersetzungen

Alle UI-Texte liegen unter `messages/*.json`.

### CMS-Inhalte

Die Hauptinhalte werden über `lib/directus.ts` geladen und normalisiert.
Die Pages verwenden dafür meist `safeCmsFetch(...)`, damit bei CMS-Ausfällen definierte Fallbacks greifen.

### Legacy-View-Modelle

In `types/index.ts` liegen noch ältere View-Modelle für statische Strukturen.
Die aktiven CMS-Modelle liegen in `lib/directus.ts`.

## Wichtige Hilfsdateien

### `lib/directus.ts`

Zentrale Aufgaben:

- Directus-URL und Token verwenden
- Locale-Filter setzen
- Assets sicher in URLs umwandeln
- CMS-Daten auf UI-Modelle mappen
- Fallbacks bei CMS-Fehlern liefern

### `utils/splitPipeList.ts`

Wandelt Pipe-getrennte Strings in Arrays um.

Verwendet für:

- Technologien
- Highlights
- Listen in Skills und Soft Skills

## Typische Änderungsfälle

### Fall 1: Eine neue Section soll aus Directus kommen

Dann meist relevant:

- neue Collection in Directus
- neuer Fetch/Mapper in `lib/directus.ts`
- Section-Komponente unter `components/sections/`
- Einbindung in die passende `app/[locale]/*/page.tsx`

### Fall 2: Ein bestehendes CMS-Feld soll anders angezeigt werden

Dann relevant:

- `lib/directus.ts`
- passende Section-Komponente
- ggf. Section-CSS

### Fall 3: Ein reiner Übersetzungstext ist falsch

Dann relevant:

- `messages/<locale>.json`

### Fall 4: Kontaktformular verhält sich falsch

Dann zuerst prüfen:

- `components/sections/ContactSection.tsx`
- `app/api/contact/route.ts`
- SMTP- und Turnstile-Umgebungsvariablen

## Reihenfolge beim Debuggen

1. Welche Route oder Section ist betroffen?
2. Kommt der Inhalt aus `messages/*.json` oder aus Directus?
3. Wenn aus Directus: stimmt das Mapping in `lib/directus.ts`?
4. Wenn die Ausgabe falsch aussieht: welche CSS-Datei formt sie?
5. Wenn das Formular betroffen ist: passt Frontend-Payload zur API-Validierung?

## Kurzfazit

Das Projekt ist heute primär so aufgebaut:

1. Routing und Locale-Kontext im App Router
2. Inhalte über Directus plus sichere Fallbacks
3. Darstellung in Section-Komponenten
4. UI-Texte und Legal-Texte in `messages/*.json`
