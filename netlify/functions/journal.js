import { getDb } from './utils/db.js'
import { getUserIdFromHeaders, unauthorized } from './utils/auth.js'

/**
 * Journal entries CRUD API
 * GET    /api/journal         - List entries (with optional ?mood=N filter)
 * POST   /api/journal         - Create entry
 * PUT    /api/journal?id=N    - Update entry
 * DELETE /api/journal?id=N    - Delete entry
 */
export const handler = async (event) => {
  const userId = await getUserIdFromHeaders(event.headers)
  if (!userId) return unauthorized()

  const sql = getDb()
  const params = event.queryStringParameters || {}

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const { mood, limit = '50', offset = '0' } = params

        let entries
        if (mood) {
          entries = await sql`
            SELECT * FROM journal_entries
            WHERE user_id = ${userId} AND mood = ${parseInt(mood, 10)}
            ORDER BY created_at DESC
            LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}
          `
        } else {
          entries = await sql`
            SELECT * FROM journal_entries
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}
          `
        }

        return json(200, { entries })
      }

      case 'POST': {
        const body = JSON.parse(event.body)
        const { mood, prompt, content, title, wordCount, analyzed } = body

        if (!content || content.trim().length === 0) {
          return json(400, { error: 'Content is required' })
        }

        const [entry] = await sql`
          INSERT INTO journal_entries (user_id, mood, prompt, content, title, word_count, analyzed)
          VALUES (${userId}, ${mood || 3}, ${prompt || 'free-write'}, ${content}, ${title || 'Untitled'}, ${wordCount || 0}, ${analyzed || false})
          RETURNING *
        `

        return json(201, { entry })
      }

      case 'PUT': {
        const { id } = params
        if (!id) return json(400, { error: 'Entry ID required' })

        const body = JSON.parse(event.body)
        const { mood, prompt, content, title, wordCount, analyzed } = body

        const [entry] = await sql`
          UPDATE journal_entries
          SET mood = COALESCE(${mood}, mood),
              prompt = COALESCE(${prompt}, prompt),
              content = COALESCE(${content}, content),
              title = COALESCE(${title}, title),
              word_count = COALESCE(${wordCount}, word_count),
              analyzed = COALESCE(${analyzed}, analyzed)
          WHERE id = ${parseInt(id, 10)} AND user_id = ${userId}
          RETURNING *
        `

        if (!entry) return json(404, { error: 'Entry not found' })
        return json(200, { entry })
      }

      case 'DELETE': {
        const { id } = params
        if (!id) return json(400, { error: 'Entry ID required' })

        const result = await sql`
          DELETE FROM journal_entries
          WHERE id = ${parseInt(id, 10)} AND user_id = ${userId}
          RETURNING id
        `

        if (result.length === 0) return json(404, { error: 'Entry not found' })
        return json(200, { deleted: true })
      }

      default:
        return json(405, { error: 'Method not allowed' })
    }
  } catch (err) {
    console.error('journal error:', err)
    return json(500, { error: 'Internal server error' })
  }
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}
