import { Client, Databases, ID, Query } from 'appwrite';

// Appwrite Konfiguration
const ENDPOINT = process.env.REACT_APP_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.REACT_APP_APPWRITE_PROJECT_ID || '698ee816003631ef3d09';
const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID || 'wg-organiser';

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

const databases = new Databases(client);

const COLLECTIONS = {
  stays: 'stays',
  manuals: 'manuals',
  messages: 'messages',
  events: 'events',
  berlin_links: 'berlin_links',
  settings: 'settings',
};

// Hilfsfunktionen
const nowIso = () => new Date().toISOString();

const parseJson = (str, defaultValue = null) => {
  try {
    return str ? JSON.parse(str) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// ============ STAYS ============
export const staysApi = {
  async list() {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.stays);
    return response.documents.map(doc => ({
      id: doc.id,
      room: doc.room,
      occupant_name: doc.occupant_name,
      start_date: doc.start_date,
      end_date: doc.end_date,
      notes: doc.notes || '',
      checklist_in: parseJson(doc.checklist_in, []),
      checklist_out: parseJson(doc.checklist_out, []),
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    }));
  },

  async get(id) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.stays, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length === 0) return null;
    const doc = docs.documents[0];
    return {
      id: doc.id,
      room: doc.room,
      occupant_name: doc.occupant_name,
      start_date: doc.start_date,
      end_date: doc.end_date,
      notes: doc.notes || '',
      checklist_in: parseJson(doc.checklist_in, []),
      checklist_out: parseJson(doc.checklist_out, []),
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  },

  async create(data) {
    const id = ID.unique();
    const now = nowIso();
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.stays, id, {
      id: id,
      room: data.room,
      occupant_name: data.occupant_name,
      start_date: data.start_date,
      end_date: data.end_date,
      notes: data.notes || '',
      checklist_in: JSON.stringify(data.checklist_in || []),
      checklist_out: JSON.stringify(data.checklist_out || []),
      created_at: now,
      updated_at: now,
    });
    return {
      id: doc.id,
      room: doc.room,
      occupant_name: doc.occupant_name,
      start_date: doc.start_date,
      end_date: doc.end_date,
      notes: doc.notes || '',
      checklist_in: parseJson(doc.checklist_in, []),
      checklist_out: parseJson(doc.checklist_out, []),
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  },

  async update(id, data) {
    // Finde das Dokument
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.stays, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length === 0) throw new Error('Stay not found');
    
    const docId = docs.documents[0].$id;
    const now = nowIso();
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.stays, docId, {
      room: data.room,
      occupant_name: data.occupant_name,
      start_date: data.start_date,
      end_date: data.end_date,
      notes: data.notes || '',
      checklist_in: JSON.stringify(data.checklist_in || []),
      checklist_out: JSON.stringify(data.checklist_out || []),
      updated_at: now,
    });
    return {
      id: doc.id,
      room: doc.room,
      occupant_name: doc.occupant_name,
      start_date: doc.start_date,
      end_date: doc.end_date,
      notes: doc.notes || '',
      checklist_in: parseJson(doc.checklist_in, []),
      checklist_out: parseJson(doc.checklist_out, []),
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  },

  async delete(id) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.stays, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.stays, docs.documents[0].$id);
    }
  },
};

// ============ MANUALS ============
export const manualsApi = {
  async list() {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.manuals);
    return response.documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      steps: parseJson(doc.steps, []),
      image_url: doc.image_url || '',
      image_data: doc.image_data || '',
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    }));
  },

  async get(id) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.manuals, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length === 0) return null;
    const doc = docs.documents[0];
    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      steps: parseJson(doc.steps, []),
      image_url: doc.image_url || '',
      image_data: doc.image_data || '',
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  },

  async create(data) {
    const id = ID.unique();
    const now = nowIso();
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.manuals, id, {
      id: id,
      title: data.title,
      description: data.description || '',
      steps: JSON.stringify(data.steps || []),
      image_url: data.image_url || '',
      image_data: data.image_data || '',
      created_at: now,
      updated_at: now,
    });
    return {
      id: doc.id,
      title: doc.title,
      description: doc.description || '',
      steps: parseJson(doc.steps, []),
      image_url: doc.image_url || '',
      image_data: doc.image_data || '',
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  },

  async update(id, data) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.manuals, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length === 0) throw new Error('Manual not found');
    
    const docId = docs.documents[0].$id;
    const now = nowIso();
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.manuals, docId, {
      title: data.title,
      description: data.description || '',
      steps: JSON.stringify(data.steps || []),
      image_url: data.image_url || '',
      image_data: data.image_data || '',
      updated_at: now,
    });
    return {
      id: doc.id,
      title: doc.title,
      description: doc.description || '',
      steps: parseJson(doc.steps, []),
      image_url: doc.image_url || '',
      image_data: doc.image_data || '',
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  },

  async delete(id) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.manuals, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.manuals, docs.documents[0].$id);
    }
  },
};

// ============ MESSAGES ============
export const messagesApi = {
  async list() {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.messages);
    // Sortiere nach created_at absteigend
    const sorted = response.documents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted.map(doc => ({
      id: doc.id,
      name: doc.name,
      content: doc.content,
      created_at: doc.created_at,
      replies: parseJson(doc.replies, []),
    }));
  },

  async create(data) {
    const id = ID.unique();
    const now = nowIso();
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.messages, id, {
      id: id,
      name: data.name,
      content: data.content,
      created_at: now,
      replies: JSON.stringify([]),
    });
    return {
      id: doc.id,
      name: doc.name,
      content: doc.content,
      created_at: doc.created_at,
      replies: [],
    };
  },

  async update(id, data) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.messages, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length === 0) throw new Error('Message not found');
    
    const docId = docs.documents[0].$id;
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.messages, docId, {
      content: data.content,
      replies: JSON.stringify(data.replies || []),
    });
    return {
      id: doc.id,
      name: doc.name,
      content: doc.content,
      created_at: doc.created_at,
      replies: parseJson(doc.replies, []),
    };
  },

  async delete(id) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.messages, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.messages, docs.documents[0].$id);
    }
  },
};

// ============ EVENTS ============
export const eventsApi = {
  async list() {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.events);
    return response.documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      date: doc.date,
      location: doc.location,
      description: doc.description,
      hashtags: parseJson(doc.hashtags, []),
      created_at: doc.created_at,
    }));
  },

  async create(data) {
    const id = ID.unique();
    const now = nowIso();
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.events, id, {
      id: id,
      title: data.title,
      date: data.date,
      location: data.location,
      description: data.description,
      hashtags: JSON.stringify(data.hashtags || []),
      created_at: now,
    });
    return {
      id: doc.id,
      title: doc.title,
      date: doc.date,
      location: doc.location,
      description: doc.description,
      hashtags: parseJson(doc.hashtags, []),
      created_at: doc.created_at,
    };
  },

  async update(id, data) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.events, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length === 0) throw new Error('Event not found');
    
    const docId = docs.documents[0].$id;
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.events, docId, {
      title: data.title,
      date: data.date,
      location: data.location,
      description: data.description,
      hashtags: JSON.stringify(data.hashtags || []),
    });
    return {
      id: doc.id,
      title: doc.title,
      date: doc.date,
      location: doc.location,
      description: doc.description,
      hashtags: parseJson(doc.hashtags, []),
      created_at: doc.created_at,
    };
  },

  async delete(id) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.events, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.events, docs.documents[0].$id);
    }
  },
};

// ============ BERLIN LINKS ============
export const berlinLinksApi = {
  async list() {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.berlin_links);
    return response.documents.map(doc => ({
      id: doc.id,
      url: doc.url,
      description: doc.description,
      hashtags: parseJson(doc.hashtags, []),
      created_at: doc.created_at,
    }));
  },

  async create(data) {
    const id = ID.unique();
    const now = nowIso();
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.berlin_links, id, {
      id: id,
      url: data.url,
      description: data.description,
      hashtags: JSON.stringify(data.hashtags || []),
      created_at: now,
    });
    return {
      id: doc.id,
      url: doc.url,
      description: doc.description,
      hashtags: parseJson(doc.hashtags, []),
      created_at: doc.created_at,
    };
  },

  async update(id, data) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.berlin_links, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length === 0) throw new Error('Link not found');
    
    const docId = docs.documents[0].$id;
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.berlin_links, docId, {
      url: data.url,
      description: data.description,
      hashtags: JSON.stringify(data.hashtags || []),
    });
    return {
      id: doc.id,
      url: doc.url,
      description: doc.description,
      hashtags: parseJson(doc.hashtags, []),
      created_at: doc.created_at,
    };
  },

  async delete(id) {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.berlin_links, [
      Query.equal('id', id),
    ]);
    if (docs.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.berlin_links, docs.documents[0].$id);
    }
  },
};

// ============ SETTINGS ============
export const settingsApi = {
  async get() {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.settings);
    if (response.documents.length === 0) {
      // Erstelle Default-Settings
      return await this.createDefault();
    }
    const doc = response.documents[0];
    const rooms = parseJson(doc.rooms, []);
    const checkin_template = parseJson(doc.checkin_template, []);
    const checkout_template = parseJson(doc.checkout_template, []);
    
    // Wenn alle Felder leer sind, Standardwerte wiederherstellen
    if (rooms.length === 0 && checkin_template.length === 0 && checkout_template.length === 0) {
      return await this.restoreDefaults(doc.$id);
    }
    
    return {
      id: doc.id,
      rooms,
      checkin_template,
      checkout_template,
      updated_at: doc.updated_at,
    };
  },

  async restoreDefaults(docId) {
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
    const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.settings, docId, {
      rooms: JSON.stringify(defaultSettings.rooms),
      checkin_template: JSON.stringify(defaultSettings.checkin_template),
      checkout_template: JSON.stringify(defaultSettings.checkout_template),
      updated_at: now,
    });
    return {
      id: updated.id,
      rooms: parseJson(updated.rooms, []),
      checkin_template: parseJson(updated.checkin_template, []),
      checkout_template: parseJson(updated.checkout_template, []),
      updated_at: updated.updated_at,
    };
  },

  async createDefault() {
    const id = ID.unique();
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
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.settings, id, {
      id: id,
      rooms: JSON.stringify(defaultSettings.rooms),
      checkin_template: JSON.stringify(defaultSettings.checkin_template),
      checkout_template: JSON.stringify(defaultSettings.checkout_template),
      updated_at: now,
    });
    return {
      id: doc.id,
      rooms: parseJson(doc.rooms, []),
      checkin_template: parseJson(doc.checkin_template, []),
      checkout_template: parseJson(doc.checkout_template, []),
      updated_at: doc.updated_at,
    };
  },

  async update(data) {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.settings);
    if (response.documents.length === 0) {
      return await this.createDefault();
    }
    const doc = response.documents[0];
    const now = nowIso();
    const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.settings, doc.$id, {
      rooms: JSON.stringify(data.rooms || []),
      checkin_template: JSON.stringify(data.checkin_template || []),
      checkout_template: JSON.stringify(data.checkout_template || []),
      updated_at: now,
    });
    return {
      id: updated.id,
      rooms: parseJson(updated.rooms, []),
      checkin_template: parseJson(updated.checkin_template, []),
      checkout_template: parseJson(updated.checkout_template, []),
      updated_at: updated.updated_at,
    };
  },
};

export default {
  stays: staysApi,
  manuals: manualsApi,
  messages: messagesApi,
  events: eventsApi,
  berlinLinks: berlinLinksApi,
  settings: settingsApi,
};
