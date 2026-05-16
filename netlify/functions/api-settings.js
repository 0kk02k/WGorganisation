const { handlers } = require('./neon-helpers');

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path.replace('/api/', '').replace('settings', '').replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);

  try {
    if (method === 'GET') {
      const result = await handlers.settings.get();
      return { statusCode: 200, body: JSON.stringify(result) };
    }
    if (method === 'PUT' || method === 'POST') {
      const data = JSON.parse(event.body);
      const result = await handlers.settings.update(data);
      return { statusCode: 200, body: JSON.stringify(result) };
    }
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    console.error('Settings error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
