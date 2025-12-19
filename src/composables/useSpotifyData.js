import { ref } from 'vue'
import { SPOTIFY_ENDPOINTS } from '@/config/spotify'

export function useSpotifyData() {
  const isLoading = ref(false)
  const error = ref(null)
  const spotifyData = ref(null)

  const fetchSpotifyData = async (accessToken, options = {}) => {
    const {
      recentLimit = 50,
      topLimit = 20,
      timeRange = 'medium_term', // short_term, medium_term, long_term
    } = options

    isLoading.value = true
    error.value = null

    try {
      // Fetch data in parallel
      const [recentlyPlayed, topTracks, topArtists] = await Promise.all([
        fetchRecentlyPlayed(accessToken, recentLimit),
        fetchTopTracks(accessToken, topLimit, timeRange),
        fetchTopArtists(accessToken, topLimit, timeRange),
      ])

      // Get audio features for recent tracks
      const trackIds = recentlyPlayed.items
        .map(item => item.track.id)
        .slice(0, 50)

      const audioFeatures = trackIds.length > 0
        ? await fetchAudioFeatures(accessToken, trackIds)
        : []

      // Analyze the data
      const analysis = analyzeSpotifyData(recentlyPlayed, topTracks, topArtists, audioFeatures)

      // Format for AI analysis
      const content = formatSpotifyForAnalysis(recentlyPlayed, topTracks, topArtists, analysis)

      spotifyData.value = {
        content,
        metadata: {
          tracksAnalyzed: recentlyPlayed.items?.length || 0,
          topTracksCount: topTracks.items?.length || 0,
          topArtistsCount: topArtists.items?.length || 0,
          timeRange,
          ...analysis,
        },
      }

      return spotifyData.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchRecentlyPlayed = async (token, limit) => {
    const response = await fetch(
      `${SPOTIFY_ENDPOINTS.recentlyPlayed}?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) throw new Error('Failed to fetch recently played')
    return response.json()
  }

  const fetchTopTracks = async (token, limit, timeRange) => {
    const response = await fetch(
      `${SPOTIFY_ENDPOINTS.topTracks}?limit=${limit}&time_range=${timeRange}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) throw new Error('Failed to fetch top tracks')
    return response.json()
  }

  const fetchTopArtists = async (token, limit, timeRange) => {
    const response = await fetch(
      `${SPOTIFY_ENDPOINTS.topArtists}?limit=${limit}&time_range=${timeRange}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) throw new Error('Failed to fetch top artists')
    return response.json()
  }

  const fetchAudioFeatures = async (token, trackIds) => {
    const response = await fetch(
      `${SPOTIFY_ENDPOINTS.audioFeatures}?ids=${trackIds.join(',')}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) throw new Error('Failed to fetch audio features')
    const data = await response.json()
    return data.audio_features || []
  }

  const analyzeSpotifyData = (recent, topTracks, topArtists, audioFeatures) => {
    const analysis = {
      avgValence: 0,      // Happiness (0-1)
      avgEnergy: 0,       // Energy (0-1)
      avgDanceability: 0, // Danceability (0-1)
      avgTempo: 0,        // BPM
      moodCategory: 'neutral',
      topGenres: [],
      listeningPattern: '',
    }

    // Analyze audio features
    if (audioFeatures.length > 0) {
      const validFeatures = audioFeatures.filter(Boolean)
      const sum = validFeatures.reduce((acc, f) => ({
        valence: acc.valence + (f.valence || 0),
        energy: acc.energy + (f.energy || 0),
        danceability: acc.danceability + (f.danceability || 0),
        tempo: acc.tempo + (f.tempo || 0),
      }), { valence: 0, energy: 0, danceability: 0, tempo: 0 })

      const count = validFeatures.length
      analysis.avgValence = Math.round((sum.valence / count) * 100) / 100
      analysis.avgEnergy = Math.round((sum.energy / count) * 100) / 100
      analysis.avgDanceability = Math.round((sum.danceability / count) * 100) / 100
      analysis.avgTempo = Math.round(sum.tempo / count)

      // Determine mood category
      if (analysis.avgValence > 0.6 && analysis.avgEnergy > 0.6) {
        analysis.moodCategory = 'happy & energetic'
      } else if (analysis.avgValence > 0.6) {
        analysis.moodCategory = 'happy & chill'
      } else if (analysis.avgEnergy > 0.6) {
        analysis.moodCategory = 'intense & powerful'
      } else if (analysis.avgValence < 0.4 && analysis.avgEnergy < 0.4) {
        analysis.moodCategory = 'melancholic & calm'
      } else if (analysis.avgValence < 0.4) {
        analysis.moodCategory = 'sad or contemplative'
      } else {
        analysis.moodCategory = 'balanced'
      }
    }

    // Extract top genres from artists
    if (topArtists.items?.length > 0) {
      const genreCounts = {}
      topArtists.items.forEach(artist => {
        artist.genres?.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1
        })
      })

      analysis.topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre]) => genre)
    }

    // Analyze listening time patterns
    if (recent.items?.length > 0) {
      const hours = recent.items.map(item => {
        const date = new Date(item.played_at)
        return date.getHours()
      })

      const nightCount = hours.filter(h => h >= 22 || h < 6).length
      const morningCount = hours.filter(h => h >= 6 && h < 12).length
      const afternoonCount = hours.filter(h => h >= 12 && h < 18).length
      const eveningCount = hours.filter(h => h >= 18 && h < 22).length

      const max = Math.max(nightCount, morningCount, afternoonCount, eveningCount)
      if (nightCount === max) analysis.listeningPattern = 'Night owl - mostly late night listening'
      else if (morningCount === max) analysis.listeningPattern = 'Early bird - morning music sessions'
      else if (afternoonCount === max) analysis.listeningPattern = 'Afternoon groover - midday music'
      else analysis.listeningPattern = 'Evening listener - wind-down music'
    }

    return analysis
  }

  const formatSpotifyForAnalysis = (recent, topTracks, topArtists, analysis) => {
    const lines = [
      'SPOTIFY LISTENING ANALYSIS',
      '',
      '=== MOOD METRICS ===',
      `Overall Mood: ${analysis.moodCategory}`,
      `Happiness Score (Valence): ${Math.round(analysis.avgValence * 100)}%`,
      `Energy Level: ${Math.round(analysis.avgEnergy * 100)}%`,
      `Danceability: ${Math.round(analysis.avgDanceability * 100)}%`,
      `Average Tempo: ${analysis.avgTempo} BPM`,
      '',
      `Listening Pattern: ${analysis.listeningPattern}`,
      '',
      '=== TOP GENRES ===',
      analysis.topGenres.length > 0
        ? analysis.topGenres.map((g, i) => `${i + 1}. ${g}`).join('\n')
        : 'No genre data available',
      '',
      '=== TOP ARTISTS ===',
    ]

    if (topArtists.items?.length > 0) {
      topArtists.items.slice(0, 10).forEach((artist, i) => {
        lines.push(`${i + 1}. ${artist.name} (Popularity: ${artist.popularity}/100)`)
      })
    }

    lines.push('')
    lines.push('=== TOP TRACKS ===')

    if (topTracks.items?.length > 0) {
      topTracks.items.slice(0, 10).forEach((track, i) => {
        lines.push(`${i + 1}. "${track.name}" by ${track.artists.map(a => a.name).join(', ')}`)
      })
    }

    lines.push('')
    lines.push('=== RECENT LISTENING (Last 20) ===')

    if (recent.items?.length > 0) {
      recent.items.slice(0, 20).forEach((item, i) => {
        const track = item.track
        const playedAt = new Date(item.played_at).toLocaleString()
        lines.push(`${i + 1}. "${track.name}" by ${track.artists.map(a => a.name).join(', ')} - ${playedAt}`)
      })
    }

    return lines.join('\n')
  }

  const clearData = () => {
    spotifyData.value = null
    error.value = null
  }

  return {
    isLoading,
    error,
    spotifyData,
    fetchSpotifyData,
    clearData,
  }
}
