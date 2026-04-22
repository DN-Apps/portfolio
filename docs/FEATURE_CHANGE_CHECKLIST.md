# Änderungs-Checkliste

## Zweck

Diese Checkliste deckt die typischen Änderungen im aktuellen Projektstand ab:

- neue Route oder Section
- neue oder geänderte Directus-Felder
- Änderungen am Kontaktformular
- Übersetzungen und Legal-Texte
- Responsive-Anpassungen

## 1. Neue Seite hinzufügen

### Prüfen

- braucht die Seite eine eigene Route unter `app/[locale]/...`?
- soll sie in Header oder Footer verlinkt werden?
- braucht sie Texte in allen vier Sprachdateien?

### Umsetzen

- neue Route unter `app/[locale]/<slug>/page.tsx`
- Header/Footer einbinden, wenn es eine eigenständige Seite ist
- Texte in `messages/*.json` ergänzen
- optional Styling in eigener CSS-Datei ergänzen

### Kontrollieren

- funktioniert die Route unter `de`, `en`, `sr`, `fr`?
- bleibt die aktive Navigation korrekt?
- rendert die Seite auch ohne Client-State sauber?

## 2. Neue Section auf bestehender Seite ergänzen

### Prüfen

- kommt der Inhalt aus Directus oder aus Übersetzungen?
- braucht die Section eigene Collection-Daten oder nur UI-Texte?

### Umsetzen

- `components/sections/<Name>Section.tsx` anlegen oder erweitern
- `components/sections/<Name>Section.css` ergänzen
- in passender `app/[locale]/*/page.tsx` einbinden
- bei CMS-Inhalten auch `lib/directus.ts` anpassen

### Kontrollieren

- stimmt die Reihenfolge auf der Seite?
- passt die Section auf Mobile, Landscape und Desktop?
- greifen Fallbacks, wenn das CMS keine Daten liefert?

## 3. Neues Directus-Feld integrieren

### Prüfen

- welche Collection ist betroffen?
- soll das Feld nur intern verfügbar oder sichtbar gerendert werden?

### Umsetzen

- Typdefinition in `lib/directus.ts` ergänzen
- View-Model oder Mapping-Funktion ergänzen
- Section-Komponente auf das neue Feld anpassen
- optional Übersetzungen für neue Labels ergänzen

### Kontrollieren

- ist das Feld im API-Response vorhanden?
- wird es korrekt sanitisiert oder normalisiert?
- bricht die UI nicht, wenn das Feld fehlt?

## 4. Texte oder Labels ändern

### Umsetzen

- `messages/de.json`
- `messages/en.json`
- `messages/sr.json`
- `messages/fr.json`

### Kontrollieren

- sind die Keys in allen Sprachen vorhanden?
- stimmen Namespace und Key-Namen zur Komponente?
- bleibt Serbisch in lateinischer Schreibweise?

## 5. Kontaktformular ändern

### Prüfen

- betrifft die Änderung nur UI, Validierung oder auch Versandlogik?

### Umsetzen

- Struktur und Client-Verhalten in `components/sections/ContactSection.tsx`
- Styling in `components/sections/ContactSection.css`
- Serverlogik in `app/api/contact/route.ts`
- Variablen in `.env.example` und `.env.local` prüfen

### Kontrollieren

- Pflichtfelder, Fehlermeldungen und Erfolgsmeldung stimmen
- Turnstile bleibt funktionsfähig
- Honeypot und Rate-Limit-Logik passen weiter zur Payload

## 6. Legal-Seiten ändern

### Umsetzen

- `app/[locale]/impressum/page.tsx`
- `app/[locale]/datenschutz/page.tsx`
- `app/[locale]/legal.css`
- passende Texte unter `messages/*.json`

### Kontrollieren

- Footer-Links verweisen korrekt auf beide Seiten
- Texte existieren in allen Sprachen
- Kontaktformular-Hinweis verweist weiter auf Datenschutz

## 7. Navigation oder Footer ändern

### Umsetzen

- `components/Header.tsx`
- `components/Footer.tsx`
- zugehörige CSS-Dateien

### Kontrollieren

- Desktop-Menü bleibt stabil
- Mobile-Menü schließt korrekt
- Footer-Links bleiben mehrsprachig korrekt

## 8. Sprachumschalter ändern

### Umsetzen

- `components/LanguageSwitcher.tsx`
- `components/LanguageSwitcher.css`
- ggf. `i18n.ts`

### Kontrollieren

- Seitenpfad bleibt erhalten
- aktive Sprache ist korrekt markiert
- lange Sprachlabels passen in die Breakpoints

## 9. Responsive Layout anpassen

### Prüfen

- ist das Problem global oder nur in einer Section?
- überschreibt eine spätere Media Query die gewünschte Regel?

### Umsetzen

- zuerst bestehende Breakpoints prüfen
- nur bei Bedarf neue Media Query ergänzen
- Layout-Logik in der betroffenen CSS-Datei halten

### Kontrollieren

- kleine Phones
- Landscape auf kleinen Geräten
- Tablets
- Desktop

## 10. Vor dem Abschluss prüfen

- stimmen die Übersetzungskeys in allen Sprachen?
- wurden Directus-Mappings aktualisiert, wenn neue CMS-Felder genutzt werden?
- sind Kommentare nach Codeänderungen noch korrekt?
- funktionieren Header, Footer, Legal-Links und Language Switcher?
- läuft mindestens `npm run build` sauber durch?
