import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock Vue
vi.mock('vue', () => ({
  ref: (val) => ({ value: val }),
}))

// Mock Spotify config
vi.mock('@/config/spotify', () => ({
  SPOTIFY_ENDPOINTS: {
    recentlyPlayed: 'https://api.spotify.com/v1/me/player/recently-played',
    topTracks: 'https://api.spotify.com/v1/me/top/tracks',
    topArtists: 'https://api.spotify.com/v1/me/top/artists',
    audioFeatures: 'https://api.spotify.com/v1/audio-features',
  },
}))

describe('useSpotifyData', () => {
  let useSpotifyData

  beforeEach(async () => {
    vi.resetModules()
    mockFetch.mockReset()
    const mod = await import('@/composables/useSpotifyData')
    useSpotifyData = mod.useSpotifyData
  })

  // ==========================================================================
  // analyzeSpotifyData mood categorization
  // ==========================================================================
  describe('Mood categorization', () => {
    const makeSpotifyResponse = (audioFeatures) => {
      // Setup basic responses
      mockFetch
        .mockResolvedValueOnce({ // recently played
          ok: true,
          json: async () => ({ items: [{ track: { id: 't1', name: 'Song1', artists: [{ name: 'Artist1' }] }, played_at: '2024-03-04T14:00:00Z' }] }),
        })
        .mockResolvedValueOnce({ // top tracks
          ok: true,
          json: async () => ({ items: [{ name: 'Track1', artists: [{ name: 'Artist1' }] }] }),
        })
        .mockResolvedValueOnce({ // top artists
          ok: true,
          json: async () => ({ items: [{ name: 'Artist1', popularity: 80, genres: ['pop', 'indie'] }] }),
        })
        .mockResolvedValueOnce({ // audio features
          ok: true,
          json: async () => ({ audio_features: audioFeatures }),
        })
    }

    it('should categorize happy & energetic music', async () => {
      makeSpotifyResponse([{ valence: 0.8, energy: 0.8, danceability: 0.7, tempo: 120 }])

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      expect(result.metadata.moodCategory).toBe('happy & energetic')
      expect(result.metadata.avgValence).toBeGreaterThan(0.6)
      expect(result.metadata.avgEnergy).toBeGreaterThan(0.6)
    })

    it('should categorize happy & chill music', async () => {
      makeSpotifyResponse([{ valence: 0.8, energy: 0.4, danceability: 0.5, tempo: 90 }])

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      expect(result.metadata.moodCategory).toBe('happy & chill')
    })

    it('should categorize intense & powerful music', async () => {
      makeSpotifyResponse([{ valence: 0.4, energy: 0.8, danceability: 0.6, tempo: 140 }])

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      expect(result.metadata.moodCategory).toBe('intense & powerful')
    })

    it('should categorize melancholic & calm music', async () => {
      makeSpotifyResponse([{ valence: 0.2, energy: 0.2, danceability: 0.3, tempo: 70 }])

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      expect(result.metadata.moodCategory).toBe('melancholic & calm')
    })

    it('should categorize sad or contemplative music', async () => {
      makeSpotifyResponse([{ valence: 0.2, energy: 0.5, danceability: 0.4, tempo: 100 }])

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      expect(result.metadata.moodCategory).toBe('sad or contemplative')
    })

    it('should categorize balanced music', async () => {
      makeSpotifyResponse([{ valence: 0.5, energy: 0.5, danceability: 0.5, tempo: 110 }])

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      expect(result.metadata.moodCategory).toBe('balanced')
    })

    it('should handle empty audio features', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }), // no recent tracks = no IDs to fetch features for
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }),
        })

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      expect(result.metadata.moodCategory).toBe('neutral')
      expect(result.metadata.avgValence).toBe(0)
    })

    it('should average multiple audio features', async () => {
      makeSpotifyResponse([
        { valence: 0.8, energy: 0.8, danceability: 0.6, tempo: 120 },
        { valence: 0.6, energy: 0.6, danceability: 0.8, tempo: 100 },
      ])

      // Need a second track in recently played for 2 features
      mockFetch.mockReset()
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [
            { track: { id: 't1', name: 'Song1', artists: [{ name: 'A1' }] }, played_at: '2024-03-04T14:00:00Z' },
            { track: { id: 't2', name: 'Song2', artists: [{ name: 'A2' }] }, played_at: '2024-03-04T13:00:00Z' },
          ]}),
        })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ audio_features: [
            { valence: 0.8, energy: 0.8, danceability: 0.6, tempo: 120 },
            { valence: 0.2, energy: 0.2, danceability: 0.4, tempo: 80 },
          ]}),
        })

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      // Average of 0.8 and 0.2 = 0.5
      expect(result.metadata.avgValence).toBe(0.5)
      expect(result.metadata.avgEnergy).toBe(0.5)
    })
  })

  // ==========================================================================
  // Genre extraction
  // ==========================================================================
  describe('Genre extraction', () => {
    it('should extract top genres from artists', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              { name: 'A1', popularity: 80, genres: ['pop', 'indie pop'] },
              { name: 'A2', popularity: 70, genres: ['pop', 'rock'] },
              { name: 'A3', popularity: 60, genres: ['indie pop', 'folk'] },
            ],
          }),
        })

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      // pop appears 2x, indie pop 2x, rock 1x, folk 1x
      expect(result.metadata.topGenres).toContain('pop')
      expect(result.metadata.topGenres).toContain('indie pop')
    })
  })

  // ==========================================================================
  // Error handling
  // ==========================================================================
  describe('Error handling', () => {
    it('should throw on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      const { fetchSpotifyData } = useSpotifyData()
      await expect(fetchSpotifyData('token')).rejects.toThrow('Failed to fetch recently played')
    })
  })

  // ==========================================================================
  // Output formatting
  // ==========================================================================
  describe('Output formatting', () => {
    it('should format content as readable text', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [{ track: { id: 't1', name: 'Song1', artists: [{ name: 'Artist1' }] }, played_at: '2024-03-04T14:00:00Z' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [{ name: 'TopSong', artists: [{ name: 'TopArtist' }] }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [{ name: 'TopArtist', popularity: 90, genres: ['electronic'] }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ audio_features: [{ valence: 0.7, energy: 0.7, danceability: 0.6, tempo: 128 }] }),
        })

      const { fetchSpotifyData } = useSpotifyData()
      const result = await fetchSpotifyData('token')

      expect(result.content).toContain('SPOTIFY LISTENING ANALYSIS')
      expect(result.content).toContain('MOOD METRICS')
      expect(result.content).toContain('TOP GENRES')
      expect(result.content).toContain('TOP ARTISTS')
      expect(result.content).toContain('TOP TRACKS')
      expect(result.content).toContain('RECENT LISTENING')
    })
  })
})
