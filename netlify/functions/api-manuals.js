const { handlers } = require('./neon-helpers');

exports.handler = async (event) => {
  const method = event.httpMethod;
  const rawPath = event.path || '';
  const id = rawPath
    .replace(/^\/?(api|\.netlify\/functions\/api-manuals)\/?manuals\/?/i, '')
    .replace(/\/$/, '');
  const segments = id ? [id] : [];

  try {
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
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    console.error('Manuals error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
