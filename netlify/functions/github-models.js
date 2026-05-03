/**
 * Netlify Function to proxy GitHub Models API requests
 * Uses GITHUB_TOKEN from Netlify environment variables
 * This keeps the token secret on the server side
 */
exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get GitHub token from Netlify environment variable
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'GitHub token not configured',
        message: 'Please set GITHUB_TOKEN in Netlify environment variables'
      })
    };
  }

  // Parse request body
  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  // Forward request to GitHub Models API
  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${githubToken}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.text();

    return {
      statusCode: response.status,
      body: responseData,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to call GitHub Models API',
        message: error.message 
      })
    };
  }
};
