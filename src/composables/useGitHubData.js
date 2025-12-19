import { ref } from 'vue'

const isLoading = ref(false)
const error = ref(null)
const githubData = ref(null)

export function useGitHubData() {
  const fetchGitHubData = async (token, options = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      }

      // Fetch user info
      const userResponse = await fetch('https://api.github.com/user', { headers })
      if (!userResponse.ok) throw new Error('Failed to fetch user')
      const user = await userResponse.json()

      // Fetch repos (sorted by most recent activity)
      const reposResponse = await fetch(
        `https://api.github.com/user/repos?sort=pushed&per_page=100&type=all`,
        { headers }
      )
      if (!reposResponse.ok) throw new Error('Failed to fetch repos')
      const repos = await reposResponse.json()

      // Fetch recent events/activity
      const eventsResponse = await fetch(
        `https://api.github.com/users/${user.login}/events?per_page=100`,
        { headers }
      )
      if (!eventsResponse.ok) throw new Error('Failed to fetch events')
      const events = await eventsResponse.json()

      // Process the data
      const processed = processGitHubData(user, repos, events)

      githubData.value = {
        content: formatForAnalysis(processed),
        metadata: processed,
      }

      return githubData.value
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const processGitHubData = (user, repos, events) => {
    // Language breakdown
    const languageStats = {}
    repos.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1
      }
    })
    const topLanguages = Object.entries(languageStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, repoCount: count }))

    // Analyze events for patterns
    const commitEvents = events.filter(e => e.type === 'PushEvent')
    const prEvents = events.filter(e => e.type === 'PullRequestEvent')
    const issueEvents = events.filter(e => e.type === 'IssuesEvent')

    // Time of day analysis
    const hourlyActivity = Array(24).fill(0)
    const dayOfWeekActivity = Array(7).fill(0)
    const weekendWork = { count: 0, lateNight: 0 }

    events.forEach(event => {
      const date = new Date(event.created_at)
      const hour = date.getHours()
      const day = date.getDay()

      hourlyActivity[hour]++
      dayOfWeekActivity[day]++

      // Weekend work (Saturday = 6, Sunday = 0)
      if (day === 0 || day === 6) {
        weekendWork.count++
      }

      // Late night work (10pm - 6am)
      if (hour >= 22 || hour < 6) {
        weekendWork.lateNight++
      }
    })

    // Find peak activity hours
    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity))
    const peakDay = dayOfWeekActivity.indexOf(Math.max(...dayOfWeekActivity))
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    // Recent commit messages
    const recentCommits = []
    commitEvents.forEach(event => {
      if (event.payload?.commits) {
        event.payload.commits.forEach(commit => {
          recentCommits.push({
            message: commit.message,
            date: event.created_at,
            repo: event.repo?.name,
          })
        })
      }
    })

    // Repo statistics
    const repoStats = {
      total: repos.length,
      owned: repos.filter(r => !r.fork).length,
      forked: repos.filter(r => r.fork).length,
      withIssues: repos.filter(r => r.open_issues_count > 0).length,
      stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    }

    // Burnout indicators
    const totalEvents = events.length
    const burnoutScore = calculateBurnoutScore({
      weekendWorkPercent: (weekendWork.count / totalEvents) * 100,
      lateNightPercent: (weekendWork.lateNight / totalEvents) * 100,
      recentActivityDensity: totalEvents,
    })

    return {
      user: {
        login: user.login,
        name: user.name,
        bio: user.bio,
        publicRepos: user.public_repos,
        followers: user.followers,
        following: user.following,
        createdAt: user.created_at,
      },
      repoStats,
      topLanguages,
      activityPatterns: {
        peakHour,
        peakHourFormatted: formatHour(peakHour),
        peakDay: dayNames[peakDay],
        hourlyActivity,
        dayOfWeekActivity,
        weekendWorkPercent: Math.round((weekendWork.count / Math.max(totalEvents, 1)) * 100),
        lateNightPercent: Math.round((weekendWork.lateNight / Math.max(totalEvents, 1)) * 100),
      },
      activitySummary: {
        totalRecentEvents: totalEvents,
        commits: commitEvents.length,
        pullRequests: prEvents.length,
        issues: issueEvents.length,
      },
      recentCommits: recentCommits.slice(0, 20),
      burnoutScore,
      burnoutLevel: getBurnoutLevel(burnoutScore),
    }
  }

  const calculateBurnoutScore = ({ weekendWorkPercent, lateNightPercent, recentActivityDensity }) => {
    // Score from 0-100 (higher = more risk)
    let score = 0

    // Weekend work contributes to score
    score += weekendWorkPercent * 0.4

    // Late night work is a bigger factor
    score += lateNightPercent * 0.8

    // High activity density can indicate overwork
    if (recentActivityDensity > 50) {
      score += Math.min((recentActivityDensity - 50) * 0.3, 20)
    }

    return Math.min(Math.round(score), 100)
  }

  const getBurnoutLevel = (score) => {
    if (score < 15) return { level: 'healthy', label: 'Healthy Balance', color: '#00ff41' }
    if (score < 30) return { level: 'moderate', label: 'Moderate', color: '#facc15' }
    if (score < 50) return { level: 'elevated', label: 'Elevated Risk', color: '#f97316' }
    return { level: 'high', label: 'High Risk', color: '#ff0064' }
  }

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:00 ${period}`
  }

  const formatForAnalysis = (data) => {
    const sections = []

    sections.push('# GitHub Developer Profile Analysis')
    sections.push('')
    sections.push(`## User: ${data.user.name || data.user.login}`)
    if (data.user.bio) sections.push(`Bio: ${data.user.bio}`)
    sections.push(`Account created: ${new Date(data.user.createdAt).toLocaleDateString()}`)
    sections.push(`Public repos: ${data.user.publicRepos} | Followers: ${data.user.followers}`)
    sections.push('')

    sections.push('## Repository Statistics')
    sections.push(`- Total repositories: ${data.repoStats.total}`)
    sections.push(`- Original repos: ${data.repoStats.owned}`)
    sections.push(`- Forked repos: ${data.repoStats.forked}`)
    sections.push(`- Total stars received: ${data.repoStats.stars}`)
    sections.push('')

    sections.push('## Top Programming Languages')
    data.topLanguages.forEach((lang, i) => {
      sections.push(`${i + 1}. ${lang.language} (${lang.repoCount} repos)`)
    })
    sections.push('')

    sections.push('## Activity Patterns')
    sections.push(`- Peak activity hour: ${data.activityPatterns.peakHourFormatted}`)
    sections.push(`- Most active day: ${data.activityPatterns.peakDay}`)
    sections.push(`- Weekend work: ${data.activityPatterns.weekendWorkPercent}% of recent activity`)
    sections.push(`- Late night work (10pm-6am): ${data.activityPatterns.lateNightPercent}% of recent activity`)
    sections.push('')

    sections.push('## Recent Activity Summary')
    sections.push(`- Total recent events: ${data.activitySummary.totalRecentEvents}`)
    sections.push(`- Push events (commits): ${data.activitySummary.commits}`)
    sections.push(`- Pull requests: ${data.activitySummary.pullRequests}`)
    sections.push(`- Issues: ${data.activitySummary.issues}`)
    sections.push('')

    sections.push('## Work-Life Balance Indicator')
    sections.push(`Burnout Risk Score: ${data.burnoutScore}/100 (${data.burnoutLevel.label})`)
    sections.push('')

    if (data.recentCommits.length > 0) {
      sections.push('## Recent Commit Messages (Sample)')
      data.recentCommits.slice(0, 10).forEach(commit => {
        const shortMessage = commit.message.split('\n')[0].slice(0, 80)
        sections.push(`- "${shortMessage}"`)
      })
      sections.push('')
    }

    sections.push('## Activity Distribution by Hour')
    const maxActivity = Math.max(...data.activityPatterns.hourlyActivity)
    for (let i = 0; i < 24; i++) {
      const count = data.activityPatterns.hourlyActivity[i]
      const bar = '█'.repeat(Math.round((count / Math.max(maxActivity, 1)) * 10))
      if (count > 0) {
        sections.push(`${String(i).padStart(2, '0')}:00 ${bar} (${count})`)
      }
    }

    return sections.join('\n')
  }

  const clearData = () => {
    githubData.value = null
    error.value = null
  }

  return {
    isLoading,
    error,
    githubData,
    fetchGitHubData,
    clearData,
  }
}
