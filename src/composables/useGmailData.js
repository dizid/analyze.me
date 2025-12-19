import { ref } from 'vue'

export function useGmailData() {
  const isLoading = ref(false)
  const error = ref(null)
  const emailData = ref(null)

  const fetchEmails = async (accessToken, options = {}) => {
    const {
      maxResults = 50,
      daysBack = 30,
      includeSent = true,
      includeReceived = true,
    } = options

    isLoading.value = true
    error.value = null

    try {
      // Build query for date range
      const afterDate = new Date()
      afterDate.setDate(afterDate.getDate() - daysBack)
      const afterTimestamp = Math.floor(afterDate.getTime() / 1000)

      let query = `after:${afterTimestamp}`

      // Add sent/received filter
      const labels = []
      if (includeSent) labels.push('SENT')
      if (includeReceived) labels.push('INBOX')

      if (labels.length === 1) {
        query += ` in:${labels[0].toLowerCase()}`
      }

      // Fetch message list
      const listResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!listResponse.ok) {
        throw new Error(`Gmail API error: ${listResponse.status}`)
      }

      const listData = await listResponse.json()
      const messages = listData.messages || []

      // Fetch message details (subject, snippet, date)
      const emailDetails = await Promise.all(
        messages.slice(0, maxResults).map(async (msg) => {
          try {
            const detailResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )

            if (!detailResponse.ok) return null

            const detail = await detailResponse.json()

            const getHeader = (name) => {
              const header = detail.payload?.headers?.find(
                (h) => h.name.toLowerCase() === name.toLowerCase()
              )
              return header?.value || ''
            }

            return {
              id: msg.id,
              subject: getHeader('Subject') || '(No Subject)',
              from: getHeader('From'),
              to: getHeader('To'),
              date: getHeader('Date'),
              snippet: detail.snippet || '',
              labelIds: detail.labelIds || [],
            }
          } catch {
            return null
          }
        })
      )

      const validEmails = emailDetails.filter(Boolean)

      // Analyze email patterns
      const sentEmails = validEmails.filter((e) => e.labelIds.includes('SENT'))
      const receivedEmails = validEmails.filter((e) =>
        e.labelIds.includes('INBOX')
      )

      // Extract top correspondents
      const correspondents = {}
      validEmails.forEach((email) => {
        const contact = email.labelIds.includes('SENT')
          ? email.to
          : email.from
        if (contact) {
          const emailMatch = contact.match(/<([^>]+)>/) || [null, contact]
          const emailAddr = emailMatch[1]?.toLowerCase() || contact.toLowerCase()
          correspondents[emailAddr] = (correspondents[emailAddr] || 0) + 1
        }
      })

      const topCorrespondents = Object.entries(correspondents)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([email, count]) => ({ email, count }))

      // Format for analysis
      const content = formatEmailsForAnalysis(validEmails)

      emailData.value = {
        content,
        metadata: {
          totalEmails: validEmails.length,
          sentCount: sentEmails.length,
          receivedCount: receivedEmails.length,
          dateRange: `Last ${daysBack} days`,
          topCorrespondents,
        },
      }

      return emailData.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const formatEmailsForAnalysis = (emails) => {
    const lines = [
      `EMAIL COMMUNICATION ANALYSIS`,
      `Total Emails: ${emails.length}`,
      `Date Range: Recent communications`,
      '',
      '--- EMAIL SUBJECTS AND SNIPPETS ---',
      '',
    ]

    emails.forEach((email, index) => {
      const direction = email.labelIds.includes('SENT') ? 'SENT' : 'RECEIVED'
      lines.push(`[${index + 1}] ${direction}: ${email.subject}`)
      if (email.snippet) {
        lines.push(`    Preview: ${email.snippet.slice(0, 150)}...`)
      }
      lines.push('')
    })

    return lines.join('\n')
  }

  const clearData = () => {
    emailData.value = null
    error.value = null
  }

  return {
    isLoading,
    error,
    emailData,
    fetchEmails,
    clearData,
  }
}
