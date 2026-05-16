const { handlers } = require('./neon-helpers');

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path.replace('/api/', '').replace('stays', '').replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);

  try {
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
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    console.error('Stays error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
