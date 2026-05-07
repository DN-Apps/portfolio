# Quick Start Guide

## 1. Installation

```bash
npm install
```

## 2. Environment vorbereiten

`.env.example` nach `.env.local` kopieren und die Werte anpassen.

Wichtige Bereiche:

- SMTP für das Kontaktformular
- Cloudflare Turnstile für Bot-Schutz
- optional Directus für CMS-Inhalte

Minimal relevant:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_user
SMTP_PASS=your_password
SMTP_FROM="Portfolio Kontakt <your_user@example.com>"
CONTACT_TO_EMAIL=your_target@example.com

NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
TURNSTILE_ENFORCE=true

NEXT_PUBLIC_DIRECTUS_URL=https://your-directus.example
DIRECTUS_TOKEN=your_optional_directus_token
```

## 3. Development Server starten

```bash
npm run dev
```

Die App läuft standardmäßig unter `http://localhost:3000`.

## 4. Wichtige Routen prüfen

- `http://localhost:3000/de/about`
- `http://localhost:3000/en/projects`
- `http://localhost:3000/fr/contact`
- `http://localhost:3000/sr/languages`
- `http://localhost:3000/de/impressum`
- `http://localhost:3000/de/datenschutz`

## 5. Production Build prüfen

```bash
npm run build
npm start
```

## 6. Was kommt woher?

### UI-Texte

Aus `messages/*.json`.

### CMS-Inhalte

Aus Directus über `lib/directus.ts`.

### Kontaktformular

Frontend:

- `components/sections/ContactSection.tsx`

Backend:

- `app/api/contact/route.ts`

## 7. Häufige Änderungen

### Texte anpassen

- `messages/de.json`
- `messages/en.json`
- `messages/sr.json`
- `messages/fr.json`

### Directus-Inhalte anpassen

- Collection in Directus pflegen
- bei neuen Feldern zusätzlich `lib/directus.ts` und die passende Section anpassen

### Navigation oder Footer ändern

- `components/Header.tsx`
- `components/Footer.tsx`

### Legal-Texte ändern

- `app/[locale]/impressum/page.tsx`
- `app/[locale]/datenschutz/page.tsx`
- `messages/*.json`

## 8. Häufige Probleme

### Directus-Inhalte fehlen

- `NEXT_PUBLIC_DIRECTUS_URL` gesetzt?
- Collection öffentlich lesbar oder Token korrekt?
- `locale`-Werte in Directus passend?

### Kontaktformular sendet nicht

- SMTP-Werte korrekt?
- Turnstile-Keys gesetzt?
- Zieladresse `CONTACT_TO_EMAIL` korrekt?

### Sprachwechsel funktioniert nicht wie erwartet

- Eintrag in `i18n.ts` vorhanden?
- Texte in allen `messages/*.json` ergänzt?
- `LanguageSwitcher.tsx` angepasst?

## 9. Empfohlene Reihenfolge bei Anpassungen

1. bestimmen, ob die Änderung Text, CMS, UI oder API betrifft
2. betroffene Route oder Section öffnen
3. Übersetzungen und Mappings ergänzen
4. mit `npm run build` validieren
