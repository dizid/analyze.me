export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', retryable = false) {
    super(message)
    this.code = code
    this.retryable = retryable
    this.name = 'AppError'
  }
}

export const ERROR_CODES = {
  GOOGLE_AUTH_FAILED: 'GOOGLE_AUTH_FAILED',
  DOCUMENT_FETCH_FAILED: 'DOCUMENT_FETCH_FAILED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
}

export const ERROR_MESSAGES = {
  [ERROR_CODES.GOOGLE_AUTH_FAILED]: 'Failed to authenticate with Google. Please try again.',
  [ERROR_CODES.DOCUMENT_FETCH_FAILED]: 'Could not fetch document content. Please check permissions.',
  [ERROR_CODES.ANALYSIS_FAILED]: 'Analysis failed. Please try again.',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
}

export const handleError = (error) => {
  console.error('Application error:', error)

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      retryable: error.retryable,
    }
  }

  // Handle common errors
  if (error.code === 'ECONNABORTED') {
    return {
      message: ERROR_MESSAGES[ERROR_CODES.TIMEOUT],
      code: ERROR_CODES.TIMEOUT,
      retryable: true,
    }
  }

  if (error.response?.status === 429) {
    return {
      message: ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      retryable: true,
    }
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    retryable: false,
  }
}
