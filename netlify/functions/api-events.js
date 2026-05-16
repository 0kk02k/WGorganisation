const { handlers } = require('./neon-helpers');

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path.replace('/api/', '').replace('events', '').replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);

  try {
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
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    console.error('Events error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
