// Turso HTTP API Helper for Netlify Functions
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

function getBaseUrl() {
  // Convert libsql:// to https://
  return TURSO_URL.replace('libsql://', 'https://');
}

async function tursoFetch(sql, args = []) {
  const response = await fetch(`${getBaseUrl()}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args } },
        { type: 'close' },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Turso HTTP error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const results = data.results || [];
  const executeResult = results.find(r => r.type === 'execute');
  
  if (executeResult && executeResult.response && executeResult.response.type === 'error') {
    throw new Error(`Turso SQL error: ${executeResult.response.error.message}`);
  }

  return executeResult?.response?.result || { rows: [], cols: [] };
}

function rowsToObjects(result) {
  if (!result || !result.rows || !result.cols) return [];
  const cols = result.cols.map(c => c.name);
  return result.rows.map(row => {
    const obj = {};
    cols.forEach((col, i) => {
      obj[col] = row[i] !== null ? row[i].value ?? row[i] : null;
    });
    return obj;
  });
}

const parseJson = (str, defaultValue = null) => {
  try {
    return str ? JSON.parse(str) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const nowIso = () => new Date().toISOString();

// ============ STAYS ============
const staysHandlers = {
  async list() {
    const result = await tursoFetch('SELECT * FROM stays ORDER BY created_at DESC');
    return rowsToObjects(result).map(row => ({
      id: row.id,
      room: row.room,
      occupant_name: row.occupant_name,
      start_date: row.start_date,
      end_date: row.end_date,
      notes: row.notes || '',
      checklist_in: parseJson(row.checklist_in, []),
      checklist_out: parseJson(row.checklist_out, []),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  async get(id) {
    const result = await tursoFetch('SELECT * FROM stays WHERE id = ?', [id]);
    const rows = rowsToObjects(result);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      room: row.room,
      occupant_name: row.occupant_name,
      start_date: row.start_date,
      end_date: row.end_date,
      notes: row.notes || '',
      checklist_in: parseJson(row.checklist_in, []),
      checklist_out: parseJson(row.checklist_out, []),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = nowIso();
    await tursoFetch(
      `INSERT INTO stays (id, room, occupant_name, start_date, end_date, notes, checklist_in, checklist_out, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.room, data.occupant_name, data.start_date, data.end_date, data.notes || '',
       JSON.stringify(data.checklist_in || []), JSON.stringify(data.checklist_out || []), now, now]
    );
    return await staysHandlers.get(id);
  },

  async update(id, data) {
    const existing = await staysHandlers.get(id);
    if (!existing) throw new Error('Stay not found');
    const now = nowIso();
    await tursoFetch(
      `UPDATE stays SET room = ?, occupant_name = ?, start_date = ?, end_date = ?, notes = ?,
       checklist_in = ?, checklist_out = ?, updated_at = ? WHERE id = ?`,
      [
        data.room !== undefined ? data.room : existing.room,
        data.occupant_name !== undefined ? data.occupant_name : existing.occupant_name,
        data.start_date !== undefined ? data.start_date : existing.start_date,
        data.end_date !== undefined ? data.end_date : existing.end_date,
        data.notes !== undefined ? data.notes : (existing.notes || ''),
        JSON.stringify(data.checklist_in !== undefined ? data.checklist_in : existing.checklist_in),
        JSON.stringify(data.checklist_out !== undefined ? data.checklist_out : existing.checklist_out),
        now, id
      ]
    );
    return await staysHandlers.get(id);
  },

  async deleteStay(id) {
    await tursoFetch('DELETE FROM stays WHERE id = ?', [id]);
    return { success: true };
  },
};

// ============ MANUALS ============
const manualsHandlers = {
  async list() {
    const result = await tursoFetch('SELECT * FROM manuals ORDER BY view_count DESC');
    return rowsToObjects(result).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      steps: parseJson(row.steps, []),
      image_url: row.image_url || '',
      image_data: row.image_data || '',
      view_count: row.view_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  async get(id) {
    const result = await tursoFetch('SELECT * FROM manuals WHERE id = ?', [id]);
    const rows = rowsToObjects(result);
    if (rows.length === 0) return null;
    const row = rows[0];
    // Increment view_count async
    const currentCount = row.view_count || 0;
    tursoFetch('UPDATE manuals SET view_count = ? WHERE id = ?', [currentCount + 1, id]).catch(() => {});
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      steps: parseJson(row.steps, []),
      image_url: row.image_url || '',
      image_data: row.image_data || '',
      view_count: currentCount + 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = nowIso();
    await tursoFetch(
      `INSERT INTO manuals (id, title, description, steps, image_url, image_data, view_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [id, data.title, data.description || '', JSON.stringify(data.steps || []),
       data.image_url || '', data.image_data || '', now, now]
    );
    return await manualsHandlers.get(id);
  },

  async update(id, data) {
    const existing = await manualsHandlers.get(id);
    if (!existing) throw new Error('Manual not found');
    const now = nowIso();
    await tursoFetch(
      `UPDATE manuals SET title = ?, description = ?, steps = ?, image_url = ?, image_data = ?,
       view_count = ?, updated_at = ? WHERE id = ?`,
      [
        data.title !== undefined ? data.title : existing.title,
        data.description !== undefined ? data.description : existing.description,
        JSON.stringify(data.steps !== undefined ? data.steps : existing.steps),
        data.image_url !== undefined ? data.image_url : existing.image_url,
        data.image_data !== undefined ? data.image_data : existing.image_data,
        data.view_count !== undefined ? data.view_count : existing.view_count,
        now, id
      ]
    );
    return await manualsHandlers.get(id);
  },

  async deleteManual(id) {
    await tursoFetch('DELETE FROM manuals WHERE id = ?', [id]);
    return { success: true };
  },
};

// ============ MESSAGES ============
const messagesHandlers = {
  async list() {
    const result = await tursoFetch('SELECT * FROM messages ORDER BY created_at DESC');
    return rowsToObjects(result).map(row => ({
      id: row.id,
      name: row.name,
      content: row.content,
      created_at: row.created_at,
      replies: parseJson(row.replies, []),
    }));
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = nowIso();
    await tursoFetch(
      `INSERT INTO messages (id, name, content, replies, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.name, data.content, JSON.stringify([]), now]
    );
    const result = await tursoFetch('SELECT * FROM messages WHERE id = ?', [id]);
    const rows = rowsToObjects(result);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      content: row.content,
      created_at: row.created_at,
      replies: parseJson(row.replies, []),
    };
  },

  async update(id, data) {
    const now = nowIso();
    await tursoFetch(
      'UPDATE messages SET content = ?, replies = ? WHERE id = ?',
      [data.content, JSON.stringify(data.replies || []), id]
    );
    const result = await tursoFetch('SELECT * FROM messages WHERE id = ?', [id]);
    const rows = rowsToObjects(result);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      content: row.content,
      created_at: row.created_at,
      replies: parseJson(row.replies, []),
    };
  },

  async deleteMessage(id) {
    await tursoFetch('DELETE FROM messages WHERE id = ?', [id]);
    return { success: true };
  },
};

// ============ EVENTS ============
const eventsHandlers = {
  async list() {
    const result = await tursoFetch('SELECT * FROM events ORDER BY date ASC');
    return rowsToObjects(result).map(row => ({
      id: row.id,
      title: row.title,
      date: row.date,
      location: row.location,
      description: row.description,
      hashtags: parseJson(row.hashtags, []),
      created_at: row.created_at,
    }));
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = nowIso();
    await tursoFetch(
      `INSERT INTO events (id, title, date, location, description, hashtags, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.title, data.date, data.location, data.description, JSON.stringify(data.hashtags || []), now]
    );
    const result = await tursoFetch('SELECT * FROM events WHERE id = ?', [id]);
    const rows = rowsToObjects(result);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      date: row.date,
      location: row.location,
      description: row.description,
      hashtags: parseJson(row.hashtags, []),
      created_at: row.created_at,
    };
  },

  async update(id, data) {
    await tursoFetch(
      `UPDATE events SET title = ?, date = ?, location = ?, description = ?, hashtags = ? WHERE id = ?`,
      [data.title, data.date, data.location, data.description, JSON.stringify(data.hashtags || []), id]
    );
    const result = await tursoFetch('SELECT * FROM events WHERE id = ?', [id]);
    const rows = rowsToObjects(result);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      date: row.date,
      location: row.location,
      description: row.description,
      hashtags: parseJson(row.hashtags, []),
      created_at: row.created_at,
    };
  },

  async deleteEvent(id) {
    await tursoFetch('DELETE FROM events WHERE id = ?', [id]);
    return { success: true };
  },
};

// ============ BERLIN LINKS ============
const berlinLinksHandlers = {
  async list() {
    const result = await tursoFetch('SELECT * FROM berlin_links ORDER BY created_at DESC');
    return rowsToObjects(result).map(row => ({
      id: row.id,
      url: row.url,
      description: row.description,
      hashtags: parseJson(row.hashtags, []),
      created_at: row.created_at,
    }));
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = nowIso();
    await tursoFetch(
      `INSERT INTO berlin_links (id, url, description, hashtags, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.url, data.description, JSON.stringify(data.hashtags || []), now]
    );
    const result = await tursoFetch('SELECT * FROM berlin_links WHERE id = ?', [id]);
    const rows = rowsToObjects(result);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      url: row.url,
      description: row.description,
      hashtags: parseJson(row.hashtags, []),
      created_at: row.created_at,
    };
  },

  async update(id, data) {
    await tursoFetch(
      'UPDATE berlin_links SET url = ?, description = ?, hashtags = ? WHERE id = ?',
      [data.url, data.description, JSON.stringify(data.hashtags || []), id]
    );
    const result = await tursoFetch('SELECT * FROM berlin_links WHERE id = ?', [id]);
    const rows = rowsToObjects(result);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      url: row.url,
      description: row.description,
      hashtags: parseJson(row.hashtags, []),
      created_at: row.created_at,
    };
  },

  async deleteLink(id) {
    await tursoFetch('DELETE FROM berlin_links WHERE id = ?', [id]);
    return { success: true };
  },
};

// ============ SETTINGS ============
const settingsHandlers = {
  async get() {
    const result = await tursoFetch('SELECT * FROM settings');
    const rows = rowsToObjects(result);
    if (rows.length === 0) {
      return await settingsHandlers.createDefault();
    }
    const row = rows[0];
    const rooms = parseJson(row.rooms, []);
    const checkin_template = parseJson(row.checkin_template, []);
    const checkout_template = parseJson(row.checkout_template, []);

    if (rooms.length === 0 && checkin_template.length === 0 && checkout_template.length === 0) {
      return await settingsHandlers.restoreDefaults(row.id);
    }

    return {
      id: row.id,
      rooms,
      checkin_template,
      checkout_template,
      plantsWateredAt: row.plantsWateredAt || null,
      updated_at: row.updated_at,
    };
  },

  async restoreDefaults(id) {
    const now = nowIso();
    const defaultSettings = {
      rooms: [
        { id: 'A', name: 'Zimmer A', color: '#84cc16' },
        { id: 'B', name: 'Zimmer B', color: '#0ea5e9' },
      ],
      checkin_template: [
        'Schlüsselübergabe prüfen',
        'WLAN-Zugang mitteilen',
        'Fenster und Heizung kurz erklären',
        'Bad & Küche zeigen',
      ],
      checkout_template: [
        'Müll entsorgen',
        'Bettwäsche abziehen',
        'Fenster schließen',
        'Heizung runterdrehen',
        'Schlüssel zurücklegen',
      ],
    };
    await tursoFetch(
      `UPDATE settings SET rooms = ?, checkin_template = ?, checkout_template = ?, plantsWateredAt = NULL, updated_at = ? WHERE id = ?`,
      [JSON.stringify(defaultSettings.rooms), JSON.stringify(defaultSettings.checkin_template),
       JSON.stringify(defaultSettings.checkout_template), now, id]
    );
    return await settingsHandlers.get();
  },

  async createDefault() {
    const id = crypto.randomUUID();
    const now = nowIso();
    const defaultSettings = {
      rooms: [
        { id: '1', name: 'Zimmer 1', color: '#CCFF00' },
        { id: '2', name: 'Zimmer 2', color: '#B026FF' },
      ],
      checkin_template: [
        'Schlüssel erhalten',
        'WLAN erklärt',
        'Hausführung gemacht',
        'Handtücher übergeben',
      ],
      checkout_template: [
        'Schlüssel zurück',
        'Zimmer besenrein',
        'Bett abgezogen',
        'Müll rausgebracht',
      ],
    };
    await tursoFetch(
      `INSERT INTO settings (id, rooms, checkin_template, checkout_template, plantsWateredAt, updated_at)
       VALUES (?, ?, ?, ?, NULL, ?)`,
      [id, JSON.stringify(defaultSettings.rooms), JSON.stringify(defaultSettings.checkin_template),
       JSON.stringify(defaultSettings.checkout_template), now]
    );
    return await settingsHandlers.get();
  },

  async update(data) {
    const current = await settingsHandlers.get();
    const now = nowIso();
    const id = current.id;
    await tursoFetch(
      `UPDATE settings SET rooms = ?, checkin_template = ?, checkout_template = ?, plantsWateredAt = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(data.rooms || []), JSON.stringify(data.checkin_template || []),
       JSON.stringify(data.checkout_template || []), data.plantsWateredAt || null, now, id]
    );
    return await settingsHandlers.get();
  },
};

// ============ ROUTER ============
const handlers = {
  stays: staysHandlers,
  manuals: manualsHandlers,
  messages: messagesHandlers,
  events: eventsHandlers,
  'berlin-links': berlinLinksHandlers,
  settings: settingsHandlers,
};

exports.handlers = handlers;
