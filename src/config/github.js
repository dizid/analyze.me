export const GITHUB_CONFIG = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
  redirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/callback/github`,
  scopes: 'read:user repo',
  authEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
}

export const GITHUB_ENDPOINTS = {
  user: 'https://api.github.com/user',
  repos: 'https://api.github.com/user/repos',
  events: 'https://api.github.com/users/{username}/events',
  contributions: 'https://api.github.com/graphql',
}
