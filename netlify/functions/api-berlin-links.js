const { handlers } = require('./neon-helpers');

exports.handler = async (event) => {
  const method = event.httpMethod;
  const rawPath = event.path || '';
  const id = rawPath
    .replace(/^\/?(api|\.netlify\/functions\/api-berlin-links)\/?berlin-links\/?/i, '')
    .replace(/\/$/, '');
  const segments = id ? [id] : [];

  try {
    if (method === 'GET' && segments.length === 0) {
      return { statusCode: 200, body: JSON.stringify(await handlers.berlinLinks.list()) };
    }
    if (method === 'POST' && segments.length === 0) {
      const data = JSON.parse(event.body);
      const result = await handlers.berlinLinks.create(data);
      return { statusCode: 200, body: JSON.stringify(result) };
    }
    if (method === 'PUT' && segments.length === 1) {
      const data = JSON.parse(event.body);
      const result = await handlers.berlinLinks.update(segments[0], data);
      return { statusCode: 200, body: JSON.stringify(result) };
    }
    if (method === 'DELETE' && segments.length === 1) {
      const result = await handlers.berlinLinks.deleteLink(segments[0]);
      return { statusCode: 200, body: JSON.stringify(result) };
    }
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    console.error('Berlin links error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
