# PRD – Teilzeit-WG Webapp

## Original Problem Statement
ich benötige eine teilzeit-wg webapp die das einchecken in eine wohnung mit to-do-listen übernimmt inklusive kalender funktion wann welches der beiden zimmer besetzt ist und einer beienungsanleitungssektion wo die bedienung der einzelnen geräte hinterlegbar ist

## Architektur/Entscheidungen
- Frontend: React + React Router + Tailwind + shadcn UI + Sonner
- Backend: FastAPI mit MongoDB (MONGO_URL) und REST-APIs
- Datenmodelle: Aufenthalte (Zimmer, Zeitraum, Checklisten), Anleitungen (Text + Bild)

## Implementiert
- Dashboard mit Überblick über aktive Aufenthalte, Pflanzen-Timer und Anleitungen
- Dashboard-Widget "Pflanzen gegossen" mit Timer + Reset (lokal gespeichert)
- Kalenderansicht mit Belegungspunkten für beide Zimmer + Monatsnavigation
- Aufenthalte: Anlegen, Liste, Detailansicht, Check-in/Check-out Checklisten, Bearbeiten, Löschen
- Bedienungsanleitungen: Anlegen (Bild-Upload oder Bild-URL), Liste, Detailansicht, Beispiel-Seed
- Detailansicht der Anleitungen editierbar per Inline-Bearbeiten/Speichern
- Pflanzen-Kachel im Dashboard mit Dschungelbild und Reset-Timer
- Einstellungen: Zimmernamen & Farbcodes sowie Checklisten-Vorlagen editierbar mit Speichern
- UI-Redesign: Dark Mode Bento-Grid mit Glassmorphism, Noise-Background und neonfarbenen Akzenten
- UI-Feinschliff: Space Grotesk überall, Untertitel entfernt, subtile Rahmen + lila Akzente auf Kalender/Aufenthalte/Anleitungen
- Manuals: "How to....." Rebranding, Beispiel-Anleitungen entfernt, Lösch-Button im Editmodus
- Kalender: aktueller Tag mit Glow + Hover-Lift bei klickbaren Elementen
- Übersicht: Haus-Chat mit Nachrichten + Namen (persistiert)
- Übersicht: Organisations-Box mit Benutzerbild ersetzt
- Kalender: Aufenthalte-Liste unter dem Kalender ergänzt
- Berlin-Seite: Veranstaltungstipps posten & ansehen (Events-API)
- Navigation: Titel entfernt, Items gleichmäßig verteilt, Aufenthalte-Link entfernt (Kalender aktiv bei Stay-Details)
- Übersicht: Organisationsbild mit großem Overlay-Text "BODDIN14 WG-HUB"

## Priorisierter Backlog
**P0**
- Benutzerfeedback/Fehlerhinweise bei API-Ausfällen (vollständig abdecken)
- Kalender: Detailansicht mit Aufenthalts-Links direkt aus dem Tagespanel

**P1**
- Drag/Range-Auswahl im Kalender für schnellere Belegung
- Checklisten-Vorlagen editierbar machen
- Bildkomprimierung für Uploads

**P2**
- Export/Backup der Daten
- Benachrichtigungen für anstehende Check-outs

## Nächste Aufgaben
- Kalender-Detailpanel um direkte Links zum Aufenthalt ergänzen
- Checklisten-Vorlagen als Einstellungen speicherbar machen
- Upload-Optimierung (Komprimierung, Größenlimit)
