# Debugging: WG Organisation - Migration Appwrite zu Neon

**Datum:** 16.05.2026
**Status:** Datenbank-Daten korrekt, Netlify Functions nicht erreichbar

---

## 1. Ausgangslage

Die WG Organisation App bestand aus:
- **Frontend:** React (Netlify) - sprach direkt mit Appwrite SDK
- **Datenbank:** Appwrite Cloud (pausiert nach 7 Tagen Inaktivität)

**Architektur vorher:**
```
Netlify (Frontend) → Appwrite JavaScript SDK → Appwrite DB
```

**Problem:** Appwrite pausiert die Datenbank nach 7 Tagen Inaktivität.

---

## 2. Migrationsschritte (bisher durchgeführt)

### Schritt 1: Turso als DB (verworfen)
- Backend auf Turso (LibSQL) umgestellt
- FastAPI-Backend geschrieben (server.py)
- Daten von Appwrite nach Turso migriert

### Schritt 2: Erkenntnis - kein separates Backend nötig
- Das Frontend sprach direkt mit Appwrite (kein FastAPI im Produktivbetrieb)
- Umstellung auf Netlify Functions als serverless API-Proxy

### Schritt 3: Neon PostgreSQL (aktuell)
- Netlify hatte bereits eine Neon-DB angebunden
- Alle Netlify Functions auf `@neondatabase/serverless` umgestellt
- Schema in Neon erstellt (6 Tabellen)
- Daten von Appwrite nach Neon migriert

**Architektur jetzt:**
```
Netlify (Frontend) → Netlify Functions (/api/*) → Neon PostgreSQL
```

---

## 3. Aktueller Stand

### Was funktioniert:
- Neon PostgreSQL Verbindung (getestet via Node.js und Python)
- Alle 27 Datensätze korrekt in Neon:
  - `stays`: 9 rows (mit korrekten Daten: room=B, name=Okko, etc.)
  - `manuals`: 10 rows
  - `messages`: 1 row
  - `events`: 3 rows
  - `berlin_links`: 3 rows
  - `settings`: 1 row (rooms: ZimmerClaus, ZimmerOkko)
- Frontend-Build erfolgreich (`npx craco build` ohne Fehler)
- Alle Commits auf GitHub gepusht (main branch)

### Was NICHT funktioniert:
- **Netlify Functions geben 404 zurück**
- Weder `/api/stays` noch `/.netlify/functions/api-stays` sind erreichbar
- Selbst die Hauptseite `https://wgorganisation.netlify.app/` gibt 404

---

## 4. Debugging-Ergebnisse

### Test 1: Live API Endpoints
```bash
curl https://wgorganisation.netlify.app/api/stays
# → "Not Found - Request ID: ..."

curl https://wgorganisation.netlify.app/.netlify/functions/api-stays
# → "Not Found - Request ID: ..."

curl https://wgorganisation.netlify.app/api/settings
# → "Not Found - Request ID: ..."
```

### Test 2: Hauptseite
```bash
curl -I https://wgorganisation.netlify.app/
# → HTTP/2 404
```

**Die gesamte Site gibt 404 zurück - nicht nur die Functions!**

### Test 3: Datenbank-Daten (lokal getestet)
```javascript
// Via Node.js @neondatabase/serverless
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Wt49pwAjboZB@...' });
// stays: 9 rows ✓, manuals: 10 rows ✓, etc.
// Sample: room=B, name=Okko, start=2026-03-06 ✓
```

### Test 4: Appwrite-Daten (Originalquelle)
```python
# Via REST API (SDK v18 gibt nur Metadaten zurück!)
# list_documents() → nur id, sequence, collectionid (leere Felder!)
# REST API /v1/databases/wg-organiser/collections/stays/documents → volle Daten ✓
```

---

## 5. Mögliche Ursachen für 404

### Ursache A: Netlify Site existiert nicht mehr
- `https://wgorganisation.netlify.app/` gibt 404
- Möglicherweise wurde die Site gelöscht oder hat einen anderen Namen
- **Prüfung:** Netlify Dashboard → Sites → prüfen ob die Site noch existiert

### Ursache B: Build schlägt fehl
- Das Build-Command in `netlify.toml`:
  ```
  cd netlify/functions && npm install && cd ../../frontend && yarn install && yarn build
  ```
- Wenn `yarn install` oder `yarn build` fehlschlägt, wird nichts deployt
- **Prüfung:** Netlify Dashboard → Deployments → Build-Log prüfen

### Ursache C: Functions nicht korrekt gebundlet
- Netlify muss die Functions im Verzeichnis `netlify/functions/` erkennen
- Die `package.json` in `netlify/functions/` muss `npm install` erfolgreich ausführen
- `@neondatabase/serverless` muss installiert werden
- **Prüfung:** Netlify Dashboard → Functions Tab → sind Functions gelistet?

### Ursache D: Environment Variables fehlen
- `DATABASE_URL` muss in Netlify gesetzt sein
- Ohne sie stürzen die Functions beim Aufruf ab (aber 404 deutet auf ein anderes Problem hin)

---

## 6. Dateien im Repo

### Neue/Geänderte Dateien:
| Datei | Beschreibung |
|---|---|
| `netlify/functions/neon-helpers.js` | Neon DB Helper (CRUD für alle 6 Tabellen) |
| `netlify/functions/api-stays.js` | Netlify Function für /api/stays |
| `netlify/functions/api-manuals.js` | Netlify Function für /api/manuals |
| `netlify/functions/api-messages.js` | Netlify Function für /api/messages |
| `netlify/functions/api-events.js` | Netlify Function für /api/events |
| `netlify/functions/api-berlin-links.js` | Netlify Function für /api/berlin-links |
| `netlify/functions/api-settings.js` | Netlify Function für /api/settings |
| `netlify/functions/package.json` | Dependencies: @neondatabase/serverless |
| `netlify.toml` | Build-Command + API-Redirects |
| `frontend/src/lib/api.js` | REST API Client (ersetzt Appwrite SDK) |
| 10 Frontend-Komponenten | Import von `@/lib/appwrite` → `@/lib/api` |
| `frontend/package.json` | `appwrite` Dependency entfernt |

### Noch vorhandene alte Dateien (nicht mehr aktiv):
| Datei | Status |
|---|---|
| `frontend/src/lib/appwrite.js` | Veraltet - wird nicht mehr importiert |
| `backend/server.py` | Veraltet - FastAPI Backend (nie produktiv) |
| `backend/migrate_appwrite_to_turso.py` | Veraltet |
| `backend/setup_turso.py` | Veraltet |

---

## 7. Nächste Schritte

1. **Netlify Dashboard prüfen:**
   - Existiert die Site noch? Unter welchem Namen?
   - Deployments → Letzter Build erfolgreich oder fehlgeschlagen?
   - Build-Log lesen

2. **Wenn Build fehlschlägt:**
   - Build-Log analysieren
   - Build-Command korrigieren
   - Erneut deployen

3. **Wenn Build erfolgreich aber Functions fehlen:**
   - Functions Tab in Netlify prüfen
   - `functions`-Pfad in `netlify.toml` prüfen
   - `DATABASE_URL` Environment Variable setzen

4. **Wenn alles deployt aber Daten fehlen:**
   - `DATABASE_URL` Environment Variable prüfen
   - Neon Function-Aufruf testen

---

## 8. Bekannte Probleme (bereits behoben)

### Problem: Appwrite SDK v18 gibt leere Daten
- `list_documents()` gibt nur Metadaten (id, sequence, collectionid)
- Eigentliche Datenfelder (room, occupant_name, etc.) fehlen
- **Fix:** REST API direkt aufrufen statt SDK nutzen

### Problem: PostgreSQL Spaltenname case-sensitivity
- `plantsWateredAt` in SQL → PostgreSQL macht `plantswateredat` daraus
- **Fix:** Alle SQL-Queries auf `plantswateredat` geändert

### Problem: `o.filter is not a function`
- API-Antwort war kein Array (Error-Object statt Array)
- **Fix:** `Array.isArray(response.data) ? response.data : []` in api.js

---

## 9. Verbindungsdaten

### Neon PostgreSQL
```
Host: ep-sweet-bonus-amsb57ag-pooler.c-5.us-east-1.aws.neon.tech
DB: neondb
User: neondb_owner
Password: npg_Wt49pwAjboZB
SSL: require
```

### Connection String (für DATABASE_URL env var)
```
postgresql://neondb_owner:npg_Wt49pwAjboZB@ep-sweet-bonus-amsb57ag-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Appwrite (Quelle, veraltet)
```
Endpoint: https://fra.cloud.appwrite.io/v1
Project: 698ee816003631ef3d09
Database: wg-organiser
```
