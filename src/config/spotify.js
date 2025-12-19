export const SPOTIFY_CONFIG = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback/spotify`,
  scopes: [
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-state',
  ].join(' '),
  authEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
}

export const SPOTIFY_ENDPOINTS = {
  recentlyPlayed: 'https://api.spotify.com/v1/me/player/recently-played',
  topTracks: 'https://api.spotify.com/v1/me/top/tracks',
  topArtists: 'https://api.spotify.com/v1/me/top/artists',
  audioFeatures: 'https://api.spotify.com/v1/audio-features',
}
