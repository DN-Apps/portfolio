# Directus Integration für das Portfolio

Diese Anleitung beschreibt den aktuellen Directus-Stand der App.
Die Anwendung nutzt Directus bereits produktiv für die wichtigsten Inhaltsbereiche und lädt die Daten serverseitig im Next.js App Router.

## Überblick

Die Directus-Anbindung sitzt zentral in `lib/directus.ts`.
Dort werden:

- Collections geladen
- Locale-Filter gesetzt
- Assets auf sichere URLs normalisiert
- CMS-Daten in UI-Modelle gemappt
- Fallbacks über `safeCmsFetch(...)` ermöglicht

## Aktive Collections

Die App erwartet derzeit diese Collections:

### `hero`

- `greeting`
- `name`
- `passion`
- `languages_intro`
- `closing`
- `tech_skills`
- `brings_list`
- `focus_list`
- `portrait`
- `locale`
- `sort`

### `about_card`

- `title`
- `icon`
- `description`
- `locale`
- `sort`

### `projects`

- `title`
- `description`
- `target_group`
- `functionalities`
- `image`
- `status`
- `technologies`
- `locale`
- `sort`

Erwartete Statuswerte:

- `completed`
- `in-development`
- `planned`

### `personal`

- `title`
- `description`
- `target`
- `why`
- `details`
- `image`
- `locale`
- `sort`

### `career`

- `company`
- `position`
- `start_date`
- `end_date`
- `description`
- `highlights`
- `current`
- `locale`
- `sort`

### `skills`

- `category`
- `items`
- `locale`
- `sort`

### `soft_skills`

- `title`
- `items`
- `icon`
- `locale`
- `sort`

Hinweis:
`icon` kann Emoji oder Token sein. Im Frontend gibt es Fallbacks für bekannte Token wie `build` oder `rocket_launch`.

### `languages`

- `name`
- `proficiency`
- `locale`
- `sort`

Die textliche Level-Ausgabe wird im Frontend aus den Prozentwerten abgeleitet.

### `certificates`

- `title`
- `subtitle`
- `file`
- `year`
- `locale`
- `sort`

### `contact`

- `title`
- `description`
- `name_label`
- `email_label`
- `subject_label`
- `message_label`
- `submit`
- `locale`
- `sort`

## Umgebungsvariablen

Für die Directus-Anbindung sind aktuell relevant:

```env
NEXT_PUBLIC_DIRECTUS_URL=https://your-directus.example
DIRECTUS_TOKEN=your_optional_directus_token
```

`DIRECTUS_TOKEN` ist optional und nur nötig, wenn die Collections nicht öffentlich lesbar sind.

## Wie die App Directus nutzt

Wichtige Funktionen in `lib/directus.ts`:

- `fetchDirectusCollection(...)`
- `fetchDirectusItem(...)`
- `getProjects(...)`
- `getPersonalCards(...)`
- `getHeroContent(...)`
- `getAboutCards(...)`
- `getCareerEntries(...)`
- `getSkillGroups(...)`
- `getSoftSkillGroups(...)`
- `getLanguages(...)`
- `getCertificates(...)`
- `getContactContent(...)`
- `safeCmsFetch(...)`

Die Route-Serverkomponenten laden ihre Daten typischerweise per `Promise.all(...)` und kapseln jede Section mit `safeCmsFetch(...)`, damit die Seite auch bei CMS-Ausfällen weiter rendert.

## Neue Felder in Directus

Wichtig:
Ein neues Feld in Directus landet nicht automatisch sichtbar in der UI.

Damit ein neues Feld wirklich in der App genutzt wird, sind meist drei Schritte nötig:

1. Typdefinition und Mapping in `lib/directus.ts` erweitern
2. Props oder Render-Logik der betroffenen Section anpassen
3. optional Übersetzungen oder Labels ergänzen

Beispiel:

Wenn `projects` ein neues Feld `cta_label` erhält, musst du:

1. `DirectusProject` erweitern
2. `ProjectContent` erweitern
3. das Mapping in `getProjects(...)` ergänzen
4. `ProjectsSection.tsx` so anpassen, dass das Feld gerendert wird

## Locale-Strategie

Die App filtert pro Collection mit einem `locale`-Feld.
Die Query wird in `lib/directus.ts` über `queryWithLocale(...)` ergänzt.

Empfehlung:

- `locale` als String in jeder frontendrelevanten Collection pflegen
- `sort` für stabile Reihenfolgen verwenden

## Assets

Dateifelder aus Directus werden über `getDirectusAssetUrl(...)` in sichere URLs umgewandelt.
Unterstützt werden:

- direkte sichere URLs
- Directus-Datei-IDs
- Dateiobjekte mit `id` oder `url`

## Berechtigungen

Für öffentliche Inhalte genügt in Directus üblicherweise:

- `Read` auf die benötigten Collections
- optional feldgenaue Leserechte
- keine Schreibrechte für Public

## Validierung und Fehlerverhalten

Das Frontend verwendet für Directus-Requests:

- `Accept: application/json`
- optional `Authorization: Bearer ...`
- `next: { revalidate: 60 }`

Wenn ein Request fehlschlägt, kann die betroffene Page per `safeCmsFetch(...)` auf definierte Fallback-Daten zurückfallen.

## Empfehlung für weitere Ausbaustufen

Wenn künftig mehr rechtliche oder redaktionelle Inhalte aus Directus kommen sollen, empfiehlt sich ein Hybrid-Ansatz:

1. Seitenstruktur im Code behalten
2. textnahe Inhalte aus Directus laden
3. immer einen sicheren Fallback im Frontend behalten
