exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.CLAUDE_API_KEY || event.headers['x-api-key'] || event.headers['X-API-KEY'];
  if (!apiKey) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Claude API key is not configured on the server' })
    };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody)
  });

  const responseText = await response.text();

  return {
    statusCode: response.status,
    body: responseText,
    headers: {
      'Content-Type': 'application/json'
    }
  };
};
