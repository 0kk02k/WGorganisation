# WGorganiser - WG Management Webanwendung

Eine moderne Webanwendung zur Verwaltung einer Wohngemeinschaft mit Check-in/Check-out-System, Kalender, Bedienungsanleitungen und Community-Funktionen.

## Inhaltsverzeichnis

- [Funktionen](#funktionen)
- [Tech Stack](#tech-stack)
- [Projektstruktur](#projektstruktur)
- [Schnellstart](#schnellstart)
- [API-Dokumentation](#api-dokumentation)
- [Datenmodelle](#datenmodelle)
- [Entwicklung](#entwicklung)

---

## Funktionen

### 🏠 Dashboard
- **Aufenthaltsübersicht** - Aktuelle und kommende Aufenthalte auf einen Blick
- **Pflanzen-Timer** - Erinnerung zum Gießen der Pflanzen mit automatischem Reset
- **Schnellzugriff** - Direktlinks zu allen wichtigen Bereichen

### 📅 Kalender
- **Zimmerbelegung** - Visuelle Darstellung beider Zimmer mit Zeitraum
- **Monatsnavigation** - Einfache Monatsweise-Ansicht
- **Aufenthaltsliste** - Kompakte Liste unterhalb des Kalenders
- **Veranstaltungstipps** - Tagespunkte für Events in Berlin

### 🛏️ Aufenthaltsverwaltung
- **Check-in/Check-out** - Integrierte Checklisten für Wohnungsübergabe
- **Checkliste (Ein)** - z.B. Schlüsselübergabe, WLAN-Zugang, Fenster erklären
- **Checkliste (Aus)** - z.B. Müll entsorgen, Bettwäsche abziehen, Heizung aus
- **Zimmerzuweisung** - Unterstützung für mehrere Zimmer (Standard: Zimmer A, B)

### 📖 Bedienungsanleitungen
- **Anleitungen anlegen** - Text + Bild (Upload oder URL)
- **Kategorien** - Organisiert nach Geräten/Bereichen
- **Detailansicht** - Vollständige Anleitung mit Bearbeitungsfunktion

### 🌿 Berlin-Seite
- **Veranstaltungstipps** - Events posten und ansehen
- **Linksammlung** - Nützliche Berlin-Links mit Beschreibungen & Hashtags
- **Hashtag-Filter** - Links und Events nach Themen filtern

### 💬 Haus-Chat
- **Nachrichtensystem** - Kommunikation innerhalb der WG
- **Antworten** - Threaded Replies zu Nachrichten
- **Namensanzeige** - Jede Nachricht zeigt den Verfasser

### ⚙️ Einstellungen
- **Zimmerverwaltung** - Namen und Farbcodes anpassen
- **Checklisten-Vorlagen** - Standard-Checklisten für Check-in/Check-out bearbeiten

---

## Tech Stack

### Frontend
| Technologie | Zweck |
|------------|-------|
| **React 19** | UI-Framework |
| **React Router 7** | Navigation & Routing |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI-Komponenten (Radix UI) |
| **Sonner** | Toast-Benachrichtigungen |
| **React Hook Form** | Formulare |
| **Zod** | Schema-Validierung |
| **Recharts** | Charts (z.B. Statistiken) |
| **date-fns** | Datumsformatierung |
| **Axios** | HTTP-Client |

### Backend
| Technologie | Zweck |
|------------|-------|
| **FastAPI** | REST-API Framework |
| **MongoDB** | Dokumentendatenbank |
| **Motor** | Async MongoDB-Treiber |
| **Pydantic** | Datenvalidierung |

---

## Projektstruktur

```
WGorganiser/
├── backend/                    # FastAPI Backend
│   ├── server.py              # Hauptanwendung & API-Routen
│   ├── requirements.txt       # Python-Abhängigkeiten
│   └── .env                   # Umgebungsvariablen
│
├── frontend/                   # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # React Komponenten
│   │   │   ├── stays/        # Aufenthalts-Komponenten
│   │   │   ├── manuals/      # Anleitungs-Komponenten
│   │   │   ├── layout/       # Layout-Komponenten
│   │   │   ├── ui/           # shadcn/ui Komponenten
│   │   │   └── chat/         # Chat-Komponenten
│   │   ├── pages/            # Seiten (Routes)
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── StaysPage.jsx
│   │   │   ├── StayDetail.jsx
│   │   │   ├── ManualsPage.jsx
│   │   │   ├── ManualDetail.jsx
│   │   │   ├── BerlinPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── context/          # React Contexts
│   │   ├── hooks/            # Custom Hooks
│   │   ├── lib/              # Utilities
│   │   └── App.jsx           # Haupt-App mit Routing
│   ├── package.json
│   ├── tailwind.config.js
│   └── craco.config.js
│
├── memory/                    # Projekt-Dokumentation
│   └── PRD.md                # Product Requirements Document
│
├── test_reports/             # Test-Berichte
├── tests/                    # Python-Tests
├── design_guidelines.json    # Design-Richtlinien
└── README.md                 # Diese Datei
```

---

## Schnellstart

### Voraussetzungen
- Node.js 18+
- Python 3.9+
- MongoDB (lokal oder MongoDB Atlas)

### Backend einrichten

```bash
cd backend

# virtuelle Umgebung erstellen
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oder: venv\Scripts\activate  # Windows

# Abhängigkeiten installieren
pip install -r requirements.txt

# .env Datei erstellen
cp .env.example .env  # Variablen anpassen:
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=wg_organiser
# CORS_ORIGIN=http://localhost:3000

# Server starten
uvicorn server:app --reload
```

### Frontend einrichten

```bash
cd frontend

# Abhängigkeiten installieren
yarn install  # oder: npm install

# Entwicklungsserver starten
yarn start
```

### App öffnen
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- API-Dokumentation: http://localhost:8000/docs

---

## API-Dokumentation

### Aufenthalte (Stays)

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/stays` | Alle Aufenthalte auflisten |
| POST | `/api/stays` | Neuen Aufenthalt erstellen |
| GET | `/api/stays/{id}` | Aufenthalt abrufen |
| PUT | `/api/stays/{id}` | Aufenthalt aktualisieren |
| DELETE | `/api/stays/{id}` | Aufenthalt löschen |

### Bedienungsanleitungen (Manuals)

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/manuals` | Alle Anleitungen auflisten |
| POST | `/api/manuals` | Neue Anleitung erstellen |
| GET | `/api/manuals/{id}` | Anleitung abrufen |
| PUT | `/api/manuals/{id}` | Anleitung aktualisieren |
| DELETE | `/api/manuals/{id}` | Anleitung löschen |

### Nachrichten (Messages)

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/messages` | Alle Nachrichten abrufen |
| POST | `/api/messages` | Nachricht senden |
| PUT | `/api/messages/{id}` | Nachricht bearbeiten |
| DELETE | `/api/messages/{id}` | Nachricht löschen |
| POST | `/api/messages/{id}/replies` | Antwort hinzufügen |

### Events

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/events` | Alle Events auflisten |
| POST | `/api/events` | Event erstellen |
| PUT | `/api/events/{id}` | Event aktualisieren |
| DELETE | `/api/events/{id}` | Event löschen |

### Berlin-Links

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/berlin-links` | Alle Links auflisten |
| POST | `/api/berlin-links` | Link erstellen |
| PUT | `/api/berlin-links/{id}` | Link aktualisieren |
| DELETE | `/api/berlin-links/{id}` | Link löschen |

### Einstellungen

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/settings` | Einstellungen abrufen |
| PUT | `/api/settings` | Einstellungen aktualisieren |

---

## Datenmodelle

### Stay (Aufenthalt)
```typescript
{
  id: string                    // UUID
  room: string                  // Zimmer-ID (z.B. "A", "B")
  occupant_name: string        // Name der Person
  start_date: string           // ISO-Datum
  end_date: string             // ISO-Datum
  notes?: string               // Optionale Notizen
  checklist_in: ChecklistItem[]  // Check-in Aufgaben
  checklist_out: ChecklistItem[] // Check-out Aufgaben
  created_at: string           // ISO-Timestamp
  updated_at: string           // ISO-Timestamp
}

ChecklistItem {
  id: string
  text: string
  done: boolean
}
```

### Manual (Anleitung)
```typescript
{
  id: string
  title: string
  description: string
  steps: string                // Markdown oder HTML
  image_url?: string          // Externe Bild-URL
  image_data?: string         // Base64-kodiertes Bild
  created_at: string
  updated_at: string
}
```

### Message (Nachricht)
```typescript
{
  id: string
  name: string                 // Autor-Name
  content: string             // Nachrichtentext
  created_at: string
  replies: MessageReply[]      // Antworten
}

MessageReply {
  id: string
  name: string
  content: string
  created_at: string
}
```

### Event
```typescript
{
  id: string
  title: string
  date: string                 // ISO-Datum
  location: string
  description: string
  hashtags: string[]
  created_at: string
}
```

### BerlinLink
```typescript
{
  id: string
  url: string
  description: string
  hashtags: string[]
  created_at: string
}
```

### Settings
```typescript
{
  id: string = "wg-settings"
  rooms: RoomConfig[]
  checkin_template: string[]  // Vorlage für Check-in
  checkout_template: string[]  // Vorlage für Check-out
  updated_at: string
}

RoomConfig {
  id: string
  name: string
  color: string               // Hex-Farbcode
}
```

---

## Entwicklung

### Code-Stil

- **Frontend**: ESLint + Prettier (konfiguriert)
- **Backend**: Black + isort für Python

### Testing

```bash
# Backend Tests
cd backend
pytest

# Frontend Tests
cd frontend
yarn test
```

### UI-Entwicklung

Die UI-Komponenten basieren auf [shadcn/ui](https://ui.shadcn.com/). Neue Komponenten hinzufügen:

```bash
cd frontend
npx shadcn@latest add button
```

### Webpack-Plugins

Das Frontend enthält benutzerdefinierte Webpack-Plugins:
- `health-check` - Health-Endpoints für Deployment-Checks
- `visual-edits` - Entwicklungs-Unterstützung für visuelle Bearbeitung

---

## Umgebungsvariablen

### Backend (.env)

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `MONGO_URL` | MongoDB Verbindungs-URI | erforderlich |
| `DB_NAME` | Datenbank-Name | erforderlich |
| `CORS_ORIGINS` | Erlaubte CORS-Origins | `*` |

---

## Lizenz

MIT License
