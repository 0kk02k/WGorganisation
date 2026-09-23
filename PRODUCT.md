# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primär die Bewohner der Teilzeit-WG Boddinstraße 14 (Berlin, 2 Zimmer) — sie verwalten Belegung, Übergaben und Hauswissen. Sekundär wechselnde Gäste/Untermieter, die während ihres Aufenthalts die App selbst nutzen (Checklisten, How-to-Anleitungen, Berlin-Tipps, Haus-Chat). Gäste starten ohne Vorwissen; die App muss ihnen das Haus selbst erklären. Alle Nutzer sind deutschsprachig.

## Product Purpose

Ein passwortgeschützter Haus-Hub für eine Teilzeit-WG mit zwei Zimmern: Belegungskalender (wer ist wann in welchem Zimmer), Check-in/Check-out-Übergaben mit Checklisten, How-to-Anleitungen für Geräte und Hausregeln, Berlin-Community-Bereich (Veranstaltungstipps + dauerhafte Links mit Hashtags) und ein persistierter Haus-Chat. Erfolgreich, wenn niemand für Alltagsfragen anrufen oder schreiben muss: die App beantwortet sie.

## Positioning

Kein Produkt für viele Wohnungen, sondern das eine Haus: ein privates, passwortgeschütztes Single-Household-Hub. Die eng kopierbare Mechanik ist die Verzahnung von Belegungskalender, Zimmer-Zuordnung und Übergabe-Checklisten mit dem Hauswissen (How-tos, Berlin-Tipps) — Gäste onboarden sich über die App selbst, statt Wissen bei einzelnen Bewohnern anzufragen.

## Operating Context

- Nutzung gleichermaßen auf Smartphone und Desktop/Tablet — kein Gerät darf zweitrangig sein.
- Zugriff über ein gemeinsames Haus-Passwort (`REACT_APP_SITE_PASSWORD`, Flag in `sessionStorage`); keine Benutzerkonten, keine Rollen.
- Einsatz im Wohnungsalltag: kurze Checks („Wann ist wer da?", „Wie läuft die Waschmaschine?"), Übergaben beim Zimmerwechsel.
- Sprache der gesamten UI: Deutsch (`lang="de"`).
- Deployment: Netlify (SPA + Functions als API-Proxy); Backend FastAPI mit Turso/LibSQL (`backend/server.py`, `backend/schema.sql`).

## Capabilities and Constraints

- **Belegungskalender**: Zimmer-Balken, Monatsnavigation, Tagesdetail mit Aufenthaltsliste und Berlin-Veranstaltungstipps; aktiver Tag hervorgehoben.
- **Aufenthalte**: Anlegen, Bearbeiten, Löschen, Detailansicht; Check-in-/Check-out-Checklisten aus editierbaren Vorlagen (Einstellungen).
- **Anleitungen („How to.....")**: Titel, Beschreibung, Schritte, Bild-Upload oder Bild-URL; Inline-Bearbeiten im Detail; Löschen nur im Editmodus.
- **Berlin**: Veranstaltungstipps + dauerhafte Links mit Hashtags, Hashtag-Filter über beide Listen, Zwei-Spalten-Layout, zentraler Post-Modal, Bearbeiten und Löschen.
- **Übersicht (Dashboard)**: aktive Aufenthalte, Pflanzen-Timer (lokal gespeichert, „gegossen" + Reset), Haus-Chat mit Antworten, Organisations-Box mit „BODDIN14 WG-HUB"-Overlay.
- **Einstellungen**: Zimmernamen + Farbcodes, Check-in-/Check-out-Vorlagen.
- Technisch: React 19 (CRA/craco), React Router 7, Tailwind, shadcn/ui, framer-motion, Sonner; Datenmodelle in `backend/schema.sql` (stays, manuals, messages, events, links, settings).
- Offen/nicht entschieden (nicht erfinden): definierte Accessibility-Norm (WCAG-Level) wurde nicht festgelegt; ob Gäste künftig eine reduzierte Ansicht bekommen, ist offen. Backlog mit P0 „Feedback bei API-Ausfällen vollständig abdecken" und „Kalender-Tagespanel mit direkten Aufenthalts-Links" steht in `memory/PRD.md`.

## Brand Commitments

- Name/Wordmark: **BODDIN14 WG-HUB** (Seitentitel, Hero-Overlay der Übersicht).
- Ton: Deutsch, persönlich, unkompliziert — Haus-interne Kommunikation, kein Marketing.
- Die Anleitungs-Sektion firmiert als „How to.....".
- Bindende visuelle Richtung (vom Nutzer getrieben, dokumentiert in `frontend/design-concept.md`): 60er-Jahre-Pop-Art — helles Weiß dominiert, kräftige Pop-Akzente (Gelb/Orange/Pink), tropische Nebentöne (Teal/Emerald), Space Grotesk.

## Evidence on Hand

- `memory/PRD.md`: Original-Problemstellung, implementierte Features, priorisierter Backlog — verlässliche Feature-Liste.
- `frontend/design-concept.md`: 540-zeiliges Pop-Art-Designkonzept (Palette, Typo, Komponenten).
- Echte Datenmodelle und Seed-Inhalte (Standard-Checklisten deutsch, Zimmer A/B mit Farben) in `backend/server.py`.
- **Fehlt (nicht fabrizieren):** keine Testimonials, Presse, Nutzerzahlen oder Fotos jenseits der Uploads; keine externen Brand-Assets.

## Product Principles

1. **Gäste helfen sich selbst** — Wissensspeicher (How-tos, Berlin) muss jede Alltagsfrage beantworten, bevor sie gestellt wird.
2. **Der Kalender ist die Wahrheit** — Belegung muss auf einen Blick korrekt sein; Konflikte sofort erkennbar.
3. **Mobile und Desktop erste Klasse** — gleiche Zuverlässigkeit und Bedienbarkeit auf beiden.
4. **Zuverlässigkeit schlägt Features** — Kernworkflows (Kalender, Wissen) dürfen nie still brechen; Fehler müssen sichtbar sein.
5. **Ein Haus, ein Ton** — deutsch, konkret, persönlich; nichts Generisches.
