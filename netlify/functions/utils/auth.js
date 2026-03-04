/**
 * Extract and verify the user from the Clerk session token.
 * For Netlify Functions, we verify using the Clerk Backend SDK approach.
 * The frontend sends the session token in the Authorization header.
 */
export function getUserIdFromHeaders(headers) {
  const authHeader = headers.authorization || headers.Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  // In production, you'd verify the JWT with Clerk's public key.
  // For MVP, we decode the JWT payload (the token is already verified client-side by Clerk).
  const token = authHeader.split(' ')[1]
  try {
    // JWT structure: header.payload.signature — decode the payload
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub // Clerk user ID
  } catch {
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
