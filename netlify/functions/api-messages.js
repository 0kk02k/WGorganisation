const { handlers } = require('./turso-helpers');

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path.replace('/api/', '').replace('messages', '').replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);

  try {
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
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    console.error('Messages error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
