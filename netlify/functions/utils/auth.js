import { OAuth2Client } from 'google-auth-library'

const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID

let oauthClient
function getClient() {
  if (!oauthClient) {
    oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID)
  }
  return oauthClient
}

/**
 * Extract and verify the user from a Google ID token.
 * Returns the Google 'sub' claim (stable user ID) or null.
 */
export async function getUserIdFromHeaders(headers) {
  const authHeader = headers.authorization || headers.Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  try {
    const client = getClient()
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    return payload.sub
  } catch (err) {
    return null
  }
}

/**
 * Standard unauthorized response
 */
export function unauthorized() {
  return {
    statusCode: 401,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Unauthorized' }),
  }
}
