import { describe, it, expect, vi } from 'vitest'
import { AppError, ERROR_CODES, ERROR_MESSAGES, handleError } from '@/utils/errorHandler'

// =============================================================================
// AppError class
// =============================================================================
describe('AppError', () => {
  it('should create error with all properties', () => {
    const err = new AppError('Test error', 'TEST_CODE', true)
    expect(err.message).toBe('Test error')
    expect(err.code).toBe('TEST_CODE')
    expect(err.retryable).toBe(true)
    expect(err.name).toBe('AppError')
    expect(err).toBeInstanceOf(Error)
  })

  it('should default to UNKNOWN_ERROR and non-retryable', () => {
    const err = new AppError('Simple error')
    expect(err.code).toBe('UNKNOWN_ERROR')
    expect(err.retryable).toBe(false)
  })
})

// =============================================================================
// ERROR_CODES
// =============================================================================
describe('ERROR_CODES', () => {
  it('should have all expected error codes', () => {
    expect(ERROR_CODES.GOOGLE_AUTH_FAILED).toBe('GOOGLE_AUTH_FAILED')
    expect(ERROR_CODES.DOCUMENT_FETCH_FAILED).toBe('DOCUMENT_FETCH_FAILED')
    expect(ERROR_CODES.ANALYSIS_FAILED).toBe('ANALYSIS_FAILED')
    expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED')
    expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR')
    expect(ERROR_CODES.TIMEOUT).toBe('TIMEOUT')
  })
})

// =============================================================================
// ERROR_MESSAGES
// =============================================================================
describe('ERROR_MESSAGES', () => {
  it('should have a message for every error code', () => {
    Object.values(ERROR_CODES).forEach((code) => {
      expect(ERROR_MESSAGES[code]).toBeDefined()
      expect(typeof ERROR_MESSAGES[code]).toBe('string')
      expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0)
    })
  })
})

// =============================================================================
// handleError()
// =============================================================================
describe('handleError', () => {
  it('should handle AppError instances', () => {
    const err = new AppError('Auth failed', 'GOOGLE_AUTH_FAILED', true)
    const result = handleError(err)

    expect(result.message).toBe('Auth failed')
    expect(result.code).toBe('GOOGLE_AUTH_FAILED')
    expect(result.retryable).toBe(true)
  })

  it('should handle timeout errors (ECONNABORTED)', () => {
    const err = { code: 'ECONNABORTED' }
    const result = handleError(err)

    expect(result.code).toBe(ERROR_CODES.TIMEOUT)
    expect(result.retryable).toBe(true)
    expect(result.message).toBe(ERROR_MESSAGES[ERROR_CODES.TIMEOUT])
  })

  it('should handle 429 rate limit errors', () => {
    const err = { response: { status: 429 } }
    const result = handleError(err)

    expect(result.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED)
    expect(result.retryable).toBe(true)
  })

  it('should handle unknown errors', () => {
    const err = new Error('Something broke')
    const result = handleError(err)

    expect(result.code).toBe('UNKNOWN_ERROR')
    expect(result.retryable).toBe(false)
    expect(result.message).toBe('Something broke')
  })

  it('should handle errors without message', () => {
    const err = {}
    const result = handleError(err)

    expect(result.message).toBe('An unexpected error occurred')
    expect(result.retryable).toBe(false)
  })

  it('should log the error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('test')
    handleError(err)
    expect(consoleSpy).toHaveBeenCalledWith('Application error:', err)
    consoleSpy.mockRestore()
  })
})
