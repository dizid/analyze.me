export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  discoveryDocs: [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
  ],
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly'
  ].join(' '),
}

export const GOOGLE_PICKER_CONFIG = {
  viewId: 'DOCS',
  mimeTypes: [
    'application/vnd.google-apps.document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
}
