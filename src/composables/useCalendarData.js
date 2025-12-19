import { ref } from 'vue'

export function useCalendarData() {
  const isLoading = ref(false)
  const error = ref(null)
  const calendarData = ref(null)

  const fetchEvents = async (accessToken, options = {}) => {
    const {
      monthsBack = 3,
      monthsForward = 1,
    } = options

    isLoading.value = true
    error.value = null

    try {
      // Calculate time range
      const now = new Date()
      const timeMin = new Date(now)
      timeMin.setMonth(timeMin.getMonth() - monthsBack)
      const timeMax = new Date(now)
      timeMax.setMonth(timeMax.getMonth() + monthsForward)

      // Fetch calendar events
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${timeMin.toISOString()}&` +
        `timeMax=${timeMax.toISOString()}&` +
        `maxResults=250&` +
        `singleEvents=true&` +
        `orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.status}`)
      }

      const data = await response.json()
      const events = data.items || []

      // Analyze event patterns
      const analysis = analyzeEvents(events)

      // Format for AI analysis
      const content = formatEventsForAnalysis(events, analysis)

      calendarData.value = {
        content,
        metadata: {
          totalEvents: events.length,
          dateRange: `${formatDate(timeMin)} - ${formatDate(timeMax)}`,
          ...analysis,
        },
      }

      return calendarData.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const analyzeEvents = (events) => {
    const stats = {
      totalMeetings: 0,
      avgMeetingsPerWeek: 0,
      weekendEvents: 0,
      earlyMorningEvents: 0,  // before 9am
      lateEveningEvents: 0,   // after 6pm
      allDayEvents: 0,
      recurringEvents: 0,
      workEvents: 0,
      personalEvents: 0,
      busiestDay: null,
      busiestHour: null,
    }

    const dayCount = {}
    const hourCount = {}
    const weekCount = {}

    events.forEach((event) => {
      const start = event.start?.dateTime || event.start?.date
      if (!start) return

      const startDate = new Date(start)
      const dayOfWeek = startDate.getDay()
      const hour = startDate.getHours()
      const weekNum = getWeekNumber(startDate)

      // Count meetings
      stats.totalMeetings++

      // Day of week analysis
      dayCount[dayOfWeek] = (dayCount[dayOfWeek] || 0) + 1

      // Hour analysis
      if (event.start?.dateTime) {
        hourCount[hour] = (hourCount[hour] || 0) + 1

        if (hour < 9) stats.earlyMorningEvents++
        if (hour >= 18) stats.lateEveningEvents++
      }

      // Week analysis
      weekCount[weekNum] = (weekCount[weekNum] || 0) + 1

      // Weekend events
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        stats.weekendEvents++
      }

      // All-day events
      if (event.start?.date && !event.start?.dateTime) {
        stats.allDayEvents++
      }

      // Recurring events
      if (event.recurringEventId) {
        stats.recurringEvents++
      }

      // Categorize work vs personal (heuristic)
      const summary = (event.summary || '').toLowerCase()
      const workKeywords = ['meeting', 'call', 'sync', 'standup', 'review', '1:1', 'interview', 'presentation']
      const isWork = workKeywords.some(keyword => summary.includes(keyword))

      if (isWork) {
        stats.workEvents++
      } else {
        stats.personalEvents++
      }
    })

    // Calculate averages
    const weekKeys = Object.keys(weekCount)
    if (weekKeys.length > 0) {
      stats.avgMeetingsPerWeek = Math.round(stats.totalMeetings / weekKeys.length)
    }

    // Find busiest day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    if (Object.keys(dayCount).length > 0) {
      const busiestDayNum = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0][0]
      stats.busiestDay = dayNames[busiestDayNum]
    }

    // Find busiest hour
    if (Object.keys(hourCount).length > 0) {
      const busiestHourNum = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0][0]
      stats.busiestHour = `${busiestHourNum}:00`
    }

    // Work-life balance ratio
    stats.workLifeRatio = stats.totalMeetings > 0
      ? Math.round((stats.workEvents / stats.totalMeetings) * 100)
      : 0

    return stats
  }

  const formatEventsForAnalysis = (events, analysis) => {
    const lines = [
      `CALENDAR ANALYSIS`,
      `Period: ${analysis.dateRange || 'Recent months'}`,
      `Total Events: ${analysis.totalMeetings}`,
      `Average Meetings/Week: ${analysis.avgMeetingsPerWeek}`,
      `Busiest Day: ${analysis.busiestDay || 'N/A'}`,
      `Work Events: ${analysis.workEvents} (${analysis.workLifeRatio}%)`,
      `Personal Events: ${analysis.personalEvents}`,
      `Weekend Events: ${analysis.weekendEvents}`,
      `Early Morning Events (before 9am): ${analysis.earlyMorningEvents}`,
      `Late Evening Events (after 6pm): ${analysis.lateEveningEvents}`,
      '',
      '--- EVENT SUMMARIES ---',
      '',
    ]

    // Group events by category
    const recentEvents = events.slice(-50)  // Last 50 events for context

    recentEvents.forEach((event, index) => {
      const start = event.start?.dateTime || event.start?.date
      const startDate = start ? new Date(start) : null
      const dateStr = startDate ? formatDate(startDate) : 'Unknown'
      const timeStr = event.start?.dateTime
        ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'All Day'

      lines.push(`[${index + 1}] ${dateStr} ${timeStr}: ${event.summary || '(No Title)'}`)
    })

    return lines.join('\n')
  }

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const clearData = () => {
    calendarData.value = null
    error.value = null
  }

  return {
    isLoading,
    error,
    calendarData,
    fetchEvents,
    clearData,
  }
}
