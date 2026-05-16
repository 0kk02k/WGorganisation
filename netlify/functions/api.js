const { handlers } = require('./neon-helpers');

// Single API function that handles all /api/* routes
exports.handler = async (event) => {
  const method = event.httpMethod;
  const rawPath = event.path || '';
  
  // Parse: /api/stays, /api/stays/123, /api/settings, etc.
  const apiMatch = rawPath.match(/\/api\/([^\/]+)(?:\/(.+))?$/);
  if (!apiMatch) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  }
  
  const resource = apiMatch[1];
  const id = apiMatch[2] || '';
  const segments = id ? [id] : [];

  try {
    switch (resource) {
      case 'stays': {
        if (method === 'GET' && segments.length === 0) {
          return { statusCode: 200, body: JSON.stringify(await handlers.stays.list()) };
        }
        if (method === 'GET' && segments.length === 1) {
          const result = await handlers.stays.get(segments[0]);
          if (!result) return { statusCode: 404, body: JSON.stringify({ error: 'Stay not found' }) };
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'POST' && segments.length === 0) {
          const data = JSON.parse(event.body);
          const result = await handlers.stays.create(data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'PUT' && segments.length === 1) {
          const data = JSON.parse(event.body);
          const result = await handlers.stays.update(segments[0], data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'DELETE' && segments.length === 1) {
          const result = await handlers.stays.deleteStay(segments[0]);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        break;
      }
      case 'manuals': {
        if (method === 'GET' && segments.length === 0) {
          return { statusCode: 200, body: JSON.stringify(await handlers.manuals.list()) };
        }
        if (method === 'GET' && segments.length === 1) {
          const result = await handlers.manuals.get(segments[0]);
          if (!result) return { statusCode: 404, body: JSON.stringify({ error: 'Manual not found' }) };
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'POST' && segments.length === 0) {
          const data = JSON.parse(event.body);
          const result = await handlers.manuals.create(data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'PUT' && segments.length === 1) {
          const data = JSON.parse(event.body);
          const result = await handlers.manuals.update(segments[0], data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'DELETE' && segments.length === 1) {
          const result = await handlers.manuals.deleteManual(segments[0]);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        break;
      }
      case 'messages': {
        if (method === 'GET' && segments.length === 0) {
          return { statusCode: 200, body: JSON.stringify(await handlers.messages.list()) };
        }
        if (method === 'POST' && segments.length === 0) {
          const data = JSON.parse(event.body);
          const result = await handlers.messages.create(data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'PUT' && segments.length === 1) {
          const data = JSON.parse(event.body);
          const result = await handlers.messages.update(segments[0], data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'DELETE' && segments.length === 1) {
          const result = await handlers.messages.deleteMessage(segments[0]);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        break;
      }
      case 'events': {
        if (method === 'GET' && segments.length === 0) {
          return { statusCode: 200, body: JSON.stringify(await handlers.events.list()) };
        }
        if (method === 'POST' && segments.length === 0) {
          const data = JSON.parse(event.body);
          const result = await handlers.events.create(data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'PUT' && segments.length === 1) {
          const data = JSON.parse(event.body);
          const result = await handlers.events.update(segments[0], data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'DELETE' && segments.length === 1) {
          const result = await handlers.events.deleteEvent(segments[0]);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        break;
      }
      case 'berlin-links': {
        const blHandlers = handlers['berlin-links'];
        if (method === 'GET' && segments.length === 0) {
          return { statusCode: 200, body: JSON.stringify(await blHandlers.list()) };
        }
        if (method === 'POST' && segments.length === 0) {
          const data = JSON.parse(event.body);
          const result = await blHandlers.create(data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'PUT' && segments.length === 1) {
          const data = JSON.parse(event.body);
          const result = await blHandlers.update(segments[0], data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'DELETE' && segments.length === 1) {
          const result = await blHandlers.deleteLink(segments[0]);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        break;
      }
      case 'settings': {
        if (method === 'GET') {
          const result = await handlers.settings.get();
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        if (method === 'PUT' || method === 'POST') {
          const data = JSON.parse(event.body);
          const result = await handlers.settings.update(data);
          return { statusCode: 200, body: JSON.stringify(result) };
        }
        break;
      }
    }
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    console.error(`API error (${resource}):`, err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
