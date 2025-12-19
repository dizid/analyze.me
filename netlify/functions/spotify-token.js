export const handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const body = JSON.parse(event.body)
    const { code, redirect_uri, code_verifier, refresh_token, grant_type } = body

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Spotify credentials not configured' }),
      }
    }

    let tokenBody

    if (grant_type === 'refresh_token' && refresh_token) {
      // Refresh token flow
      tokenBody = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: clientId,
      })
    } else if (code) {
      // Authorization code flow with PKCE
      tokenBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: clientId,
        code_verifier,
      })
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      }
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: tokenBody,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Spotify token error:', data)
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error_description || 'Token exchange failed' }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    }
  } catch (err) {
    console.error('Spotify token error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
