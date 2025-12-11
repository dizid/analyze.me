import { ref } from 'vue'

export function useTwitterArchive() {
  const isProcessing = ref(false)
  const processingStatus = ref('')
  const error = ref(null)

  /**
   * Parse a Twitter archive ZIP file
   * Twitter archives contain tweets.js file with tweet data
   */
  const parseArchive = async (file) => {
    isProcessing.value = true
    processingStatus.value = 'Reading archive...'
    error.value = null

    try {
      // Dynamic import of JSZip for ZIP handling
      const JSZip = (await import('jszip')).default

      processingStatus.value = 'Extracting files...'
      const zip = await JSZip.loadAsync(file)

      // Look for tweets.js file in the archive
      // Twitter archives typically have: data/tweets.js or tweets.js
      let tweetsFile = zip.file('data/tweets.js') ||
                       zip.file('tweets.js') ||
                       zip.file('data/tweet.js') ||
                       zip.file('tweet.js')

      // Also check for js files in data folder
      if (!tweetsFile) {
        const files = Object.keys(zip.files)
        const tweetFileMatch = files.find(f =>
          f.toLowerCase().includes('tweet') && f.endsWith('.js')
        )
        if (tweetFileMatch) {
          tweetsFile = zip.file(tweetFileMatch)
        }
      }

      if (!tweetsFile) {
        throw new Error('Could not find tweets.js in archive. Make sure you uploaded the correct Twitter archive.')
      }

      processingStatus.value = 'Parsing tweets...'
      const content = await tweetsFile.async('string')

      return parseTweetsContent(content)
    } catch (err) {
      error.value = err.message || 'Failed to parse Twitter archive'
      throw err
    } finally {
      isProcessing.value = false
      processingStatus.value = ''
    }
  }

  /**
   * Parse a standalone JSON/JS file containing tweets
   */
  const parseJsonFile = async (file) => {
    isProcessing.value = true
    processingStatus.value = 'Reading file...'
    error.value = null

    try {
      const content = await file.text()
      return parseTweetsContent(content)
    } catch (err) {
      error.value = err.message || 'Failed to parse file'
      throw err
    } finally {
      isProcessing.value = false
      processingStatus.value = ''
    }
  }

  /**
   * Parse the content of tweets.js file
   * Twitter's tweets.js starts with: window.YTD.tweets.part0 = [...]
   */
  const parseTweetsContent = (content) => {
    try {
      // Remove the variable assignment prefix
      // Handles: window.YTD.tweets.part0 = [...] or similar patterns
      let jsonContent = content

      // Try to extract JSON array from JS file
      const jsonMatch = content.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/)
      if (jsonMatch) {
        jsonContent = jsonMatch[1]
      }

      // Parse the JSON
      let tweetsData
      try {
        tweetsData = JSON.parse(jsonContent)
      } catch {
        // If direct parse fails, try to find array in content
        const arrayStart = content.indexOf('[')
        const arrayEnd = content.lastIndexOf(']')
        if (arrayStart !== -1 && arrayEnd !== -1) {
          jsonContent = content.slice(arrayStart, arrayEnd + 1)
          tweetsData = JSON.parse(jsonContent)
        } else {
          throw new Error('Could not parse tweet data')
        }
      }

      // Extract tweet text from Twitter's data structure
      const tweets = extractTweetTexts(tweetsData)

      if (tweets.length === 0) {
        throw new Error('No tweets found in the file')
      }

      // Calculate date range
      const dates = extractDates(tweetsData)
      const dateRange = formatDateRange(dates)

      // Calculate total characters
      const charCount = tweets.reduce((sum, t) => sum + t.length, 0)

      return {
        tweets,
        tweetCount: tweets.length,
        dateRange,
        charCount,
      }
    } catch (err) {
      error.value = err.message || 'Failed to parse tweet content'
      throw err
    }
  }

  /**
   * Extract tweet text from various Twitter archive formats
   */
  const extractTweetTexts = (data) => {
    const tweets = []

    const processItem = (item) => {
      // Handle nested tweet object (Twitter's export format)
      const tweet = item.tweet || item

      // Get full_text or text
      let text = tweet.full_text || tweet.text || ''

      // Skip retweets if they're just "RT @..."
      if (text.startsWith('RT @') && text.length < 50) {
        return null
      }

      // Clean up the text
      text = cleanTweetText(text)

      // Skip very short tweets
      if (text.length < 10) {
        return null
      }

      return text
    }

    if (Array.isArray(data)) {
      for (const item of data) {
        const text = processItem(item)
        if (text) {
          tweets.push(text)
        }
      }
    }

    // Sort by most recent first (reverse chronological)
    return tweets.reverse()
  }

  /**
   * Clean tweet text for analysis
   */
  const cleanTweetText = (text) => {
    return text
      // Decode HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Remove t.co URLs (Twitter's shortened URLs)
      .replace(/https?:\/\/t\.co\/\w+/g, '')
      // Keep other URLs but simplify
      .replace(/https?:\/\/[^\s]+/g, '[link]')
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Extract dates from tweet data
   */
  const extractDates = (data) => {
    const dates = []

    const processItem = (item) => {
      const tweet = item.tweet || item
      const dateStr = tweet.created_at

      if (dateStr) {
        try {
          const date = new Date(dateStr)
          if (!isNaN(date.getTime())) {
            dates.push(date)
          }
        } catch {
          // Skip invalid dates
        }
      }
    }

    if (Array.isArray(data)) {
      data.forEach(processItem)
    }

    return dates.sort((a, b) => a - b)
  }

  /**
   * Format date range for display
   */
  const formatDateRange = (dates) => {
    if (dates.length === 0) return 'Unknown'

    const oldest = dates[0]
    const newest = dates[dates.length - 1]

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    }

    if (formatDate(oldest) === formatDate(newest)) {
      return formatDate(oldest)
    }

    return `${formatDate(oldest)} - ${formatDate(newest)}`
  }

  return {
    parseArchive,
    parseJsonFile,
    isProcessing,
    processingStatus,
    error,
  }
}
