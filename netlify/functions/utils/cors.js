// Shared CORS headers for all API functions
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }
}

// Handle OPTIONS preflight request
export function handlePreflight() {
  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: '',
  }
}
