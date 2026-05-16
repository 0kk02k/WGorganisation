// Neon PostgreSQL Helper for Netlify Functions
const { neon } = require('@neondatabase/serverless');

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL not set');
  return neon(connectionString);
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
    const sql = getSql();
    const rows = await sql`SELECT * FROM stays ORDER BY created_at DESC`;
    return rows.map(row => ({
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
    const sql = getSql();
    const rows = await sql`SELECT * FROM stays WHERE id = ${id}`;
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
    const sql = getSql();
    const id = crypto.randomUUID();
    const now = nowIso();
    await sql`
      INSERT INTO stays (id, room, occupant_name, start_date, end_date, notes, checklist_in, checklist_out, created_at, updated_at)
      VALUES (${id}, ${data.room}, ${data.occupant_name}, ${data.start_date}, ${data.end_date}, ${data.notes || ''},
              ${JSON.stringify(data.checklist_in || [])}, ${JSON.stringify(data.checklist_out || [])}, ${now}, ${now})
    `;
    return await staysHandlers.get(id);
  },

  async update(id, data) {
    const existing = await staysHandlers.get(id);
    if (!existing) throw new Error('Stay not found');
    const now = nowIso();
    const sql = getSql();
    await sql`
      UPDATE stays SET
        room = ${data.room !== undefined ? data.room : existing.room},
        occupant_name = ${data.occupant_name !== undefined ? data.occupant_name : existing.occupant_name},
        start_date = ${data.start_date !== undefined ? data.start_date : existing.start_date},
        end_date = ${data.end_date !== undefined ? data.end_date : existing.end_date},
        notes = ${data.notes !== undefined ? data.notes : (existing.notes || '')},
        checklist_in = ${JSON.stringify(data.checklist_in !== undefined ? data.checklist_in : existing.checklist_in)},
        checklist_out = ${JSON.stringify(data.checklist_out !== undefined ? data.checklist_out : existing.checklist_out)},
        updated_at = ${now}
      WHERE id = ${id}
    `;
    return await staysHandlers.get(id);
  },

  async deleteStay(id) {
    const sql = getSql();
    await sql`DELETE FROM stays WHERE id = ${id}`;
    return { success: true };
  },
};

// ============ MANUALS ============
const manualsHandlers = {
  async list() {
    const sql = getSql();
    const rows = await sql`SELECT * FROM manuals ORDER BY view_count DESC`;
    return rows.map(row => ({
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
    const sql = getSql();
    const rows = await sql`SELECT * FROM manuals WHERE id = ${id}`;
    if (rows.length === 0) return null;
    const row = rows[0];
    const currentCount = row.view_count || 0;
    sql`UPDATE manuals SET view_count = ${currentCount + 1} WHERE id = ${id}`.catch(() => {});
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
    const sql = getSql();
    const id = crypto.randomUUID();
    const now = nowIso();
    await sql`
      INSERT INTO manuals (id, title, description, steps, image_url, image_data, view_count, created_at, updated_at)
      VALUES (${id}, ${data.title}, ${data.description || ''}, ${JSON.stringify(data.steps || [])},
              ${data.image_url || ''}, ${data.image_data || ''}, 0, ${now}, ${now})
    `;
    return await manualsHandlers.get(id);
  },

  async update(id, data) {
    const existing = await manualsHandlers.get(id);
    if (!existing) throw new Error('Manual not found');
    const now = nowIso();
    const sql = getSql();
    await sql`
      UPDATE manuals SET
        title = ${data.title !== undefined ? data.title : existing.title},
        description = ${data.description !== undefined ? data.description : existing.description},
        steps = ${JSON.stringify(data.steps !== undefined ? data.steps : existing.steps)},
        image_url = ${data.image_url !== undefined ? data.image_url : existing.image_url},
        image_data = ${data.image_data !== undefined ? data.image_data : existing.image_data},
        view_count = ${data.view_count !== undefined ? data.view_count : existing.view_count},
        updated_at = ${now}
      WHERE id = ${id}
    `;
    return await manualsHandlers.get(id);
  },

  async deleteManual(id) {
    const sql = getSql();
    await sql`DELETE FROM manuals WHERE id = ${id}`;
    return { success: true };
  },
};

// ============ MESSAGES ============
const messagesHandlers = {
  async list() {
    const sql = getSql();
    const rows = await sql`SELECT * FROM messages ORDER BY created_at DESC`;
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      content: row.content,
      created_at: row.created_at,
      replies: parseJson(row.replies, []),
    }));
  },

  async create(data) {
    const sql = getSql();
    const id = crypto.randomUUID();
    const now = nowIso();
    await sql`
      INSERT INTO messages (id, name, content, replies, created_at)
      VALUES (${id}, ${data.name}, ${data.content}, ${JSON.stringify([])}, ${now})
    `;
    const rows = await sql`SELECT * FROM messages WHERE id = ${id}`;
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
    const sql = getSql();
    await sql`
      UPDATE messages SET content = ${data.content}, replies = ${JSON.stringify(data.replies || [])}
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM messages WHERE id = ${id}`;
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
    const sql = getSql();
    await sql`DELETE FROM messages WHERE id = ${id}`;
    return { success: true };
  },
};

// ============ EVENTS ============
const eventsHandlers = {
  async list() {
    const sql = getSql();
    const rows = await sql`SELECT * FROM events ORDER BY date ASC`;
    return rows.map(row => ({
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
    const sql = getSql();
    const id = crypto.randomUUID();
    const now = nowIso();
    await sql`
      INSERT INTO events (id, title, date, location, description, hashtags, created_at)
      VALUES (${id}, ${data.title}, ${data.date}, ${data.location}, ${data.description},
              ${JSON.stringify(data.hashtags || [])}, ${now})
    `;
    const rows = await sql`SELECT * FROM events WHERE id = ${id}`;
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
    const sql = getSql();
    await sql`
      UPDATE events SET title = ${data.title}, date = ${data.date}, location = ${data.location},
        description = ${data.description}, hashtags = ${JSON.stringify(data.hashtags || [])}
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM events WHERE id = ${id}`;
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
    const sql = getSql();
    await sql`DELETE FROM events WHERE id = ${id}`;
    return { success: true };
  },
};

// ============ BERLIN LINKS ============
const berlinLinksHandlers = {
  async list() {
    const sql = getSql();
    const rows = await sql`SELECT * FROM berlin_links ORDER BY created_at DESC`;
    return rows.map(row => ({
      id: row.id,
      url: row.url,
      description: row.description,
      hashtags: parseJson(row.hashtags, []),
      created_at: row.created_at,
    }));
  },

  async create(data) {
    const sql = getSql();
    const id = crypto.randomUUID();
    const now = nowIso();
    await sql`
      INSERT INTO berlin_links (id, url, description, hashtags, created_at)
      VALUES (${id}, ${data.url}, ${data.description}, ${JSON.stringify(data.hashtags || [])}, ${now})
    `;
    const rows = await sql`SELECT * FROM berlin_links WHERE id = ${id}`;
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
    const sql = getSql();
    await sql`
      UPDATE berlin_links SET url = ${data.url}, description = ${data.description},
        hashtags = ${JSON.stringify(data.hashtags || [])}
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM berlin_links WHERE id = ${id}`;
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
    const sql = getSql();
    await sql`DELETE FROM berlin_links WHERE id = ${id}`;
    return { success: true };
  },
};

// ============ SETTINGS ============
const settingsHandlers = {
  async get() {
    const sql = getSql();
    const rows = await sql`SELECT * FROM settings`;
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
      plantsWateredAt: row.plantswateredat || row.plantsWateredAt || null,
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
    const sql = getSql();
    await sql`
      UPDATE settings SET rooms = ${JSON.stringify(defaultSettings.rooms)},
        checkin_template = ${JSON.stringify(defaultSettings.checkin_template)},
        checkout_template = ${JSON.stringify(defaultSettings.checkout_template)},
        plantswateredat = NULL, updated_at = ${now}
      WHERE id = ${id}
    `;
    return await settingsHandlers.get();
  },

  async createDefault() {
    const sql = getSql();
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
    await sql`
      INSERT INTO settings (id, rooms, checkin_template, checkout_template, plantswateredat, updated_at)
      VALUES (${id}, ${JSON.stringify(defaultSettings.rooms)}, ${JSON.stringify(defaultSettings.checkin_template)},
              ${JSON.stringify(defaultSettings.checkout_template)}, NULL, ${now})
    `;
    return await settingsHandlers.get();
  },

  async update(data) {
    const current = await settingsHandlers.get();
    const now = nowIso();
    const sql = getSql();
    await sql`
      UPDATE settings SET rooms = ${JSON.stringify(data.rooms || [])},
        checkin_template = ${JSON.stringify(data.checkin_template || [])},
        checkout_template = ${JSON.stringify(data.checkout_template || [])},
        plantswateredat = ${data.plantsWateredAt || null}, updated_at = ${now}
      WHERE id = ${current.id}
    `;
    return await settingsHandlers.get();
  },
};

// ============ EXPORTS ============
const handlers = {
  stays: staysHandlers,
  manuals: manualsHandlers,
  messages: messagesHandlers,
  events: eventsHandlers,
  'berlin-links': berlinLinksHandlers,
  settings: settingsHandlers,
};

module.exports = { handlers };
