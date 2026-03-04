import { getDb } from './utils/db.js'
import { getUserIdFromHeaders, unauthorized } from './utils/auth.js'

/**
 * POST /api/user-sync
 * Syncs user data from Clerk to database (called on first login).
 */
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const userId = getUserIdFromHeaders(event.headers)
  if (!userId) return unauthorized()

  try {
    const body = JSON.parse(event.body)
    const { email, displayName, avatarUrl } = body

    const sql = getDb()

    // Upsert user
    await sql`
      INSERT INTO users (id, email, display_name, avatar_url)
      VALUES (${userId}, ${email || null}, ${displayName || null}, ${avatarUrl || null})
      ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, users.email),
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        updated_at = now()
    `

    // Ensure gamification row exists
    await sql`
      INSERT INTO user_gamification (user_id)
      VALUES (${userId})
      ON CONFLICT (user_id) DO NOTHING
    `

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    }
  } catch (err) {
    console.error('user-sync error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
