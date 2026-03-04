import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock axios before importing the module
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

import axios from 'axios'

// We need to import the handler after mocking
// Since the function uses process.env, set it up first
const originalEnv = { ...process.env }

describe('Analyze Netlify Function', () => {
  let handler

  beforeEach(async () => {
    vi.resetModules()
    process.env.ANTHROPIC_API_KEY = 'test-api-key-123'
    process.env.ALLOWED_ORIGIN = 'http://localhost:3000'

    // Re-import to get fresh module with clean rate limit state
    const mod = await import('../../netlify/functions/analyze.js')
    handler = mod.handler
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  const makeEvent = (overrides = {}) => ({
    httpMethod: 'POST',
    headers: {
      'x-forwarded-for': '127.0.0.1',
    },
    body: JSON.stringify({
      content: 'Test document content for analysis.',
      prompt: 'Analyze this document.',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.7,
      max_tokens: 400,
      output_length: 'middle',
      ...overrides,
    }),
    ...overrides._event,
  })

  // ==========================================================================
  // CORS / HTTP method handling
  // ==========================================================================
  describe('HTTP methods', () => {
    it('should handle OPTIONS preflight with CORS headers', async () => {
      const result = await handler({ httpMethod: 'OPTIONS', headers: {} })
      expect(result.statusCode).toBe(200)
      expect(result.headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000')
      expect(result.headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS')
    })

    it('should reject non-POST methods with 405', async () => {
      const result = await handler({ httpMethod: 'GET', headers: {} })
      expect(result.statusCode).toBe(405)
      expect(JSON.parse(result.body).error).toBe('Method not allowed')
    })

    it('should reject PUT method', async () => {
      const result = await handler({ httpMethod: 'PUT', headers: {} })
      expect(result.statusCode).toBe(405)
    })
  })

  // ==========================================================================
  // Input validation
  // ==========================================================================
  describe('Input validation', () => {
    it('should reject invalid model', async () => {
      const event = makeEvent({ model: 'gpt-4' })
      const result = await handler(event)
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toContain('Invalid model')
    })

    it('should accept claude-sonnet-4-20250514', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          content: [{ text: 'Analysis result' }],
          usage: { input_tokens: 10, output_tokens: 20 },
        },
      })
      const event = makeEvent({ model: 'claude-sonnet-4-20250514' })
      const result = await handler(event)
      expect(result.statusCode).toBe(200)
    })

    it('should accept claude-haiku-4-5-20251001', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          content: [{ text: 'Analysis result' }],
          usage: { input_tokens: 10, output_tokens: 20 },
        },
      })
      const event = makeEvent({ model: 'claude-haiku-4-5-20251001' })
      const result = await handler(event)
      expect(result.statusCode).toBe(200)
    })

    it('should reject invalid output_length', async () => {
      const event = makeEvent({ output_length: 'huge' })
      const result = await handler(event)
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toContain('Invalid output_length')
    })

    it('should accept valid output_lengths', async () => {
      for (const length of ['summary', 'middle', 'long']) {
        axios.post.mockResolvedValueOnce({
          data: {
            content: [{ text: 'Result' }],
            usage: { input_tokens: 10, output_tokens: 20 },
          },
        })
        const event = makeEvent({ output_length: length })
        const result = await handler(event)
        expect(result.statusCode).toBe(200)
      }
    })

    it('should reject missing content', async () => {
      const event = {
        httpMethod: 'POST',
        headers: { 'x-forwarded-for': '10.0.0.1' },
        body: JSON.stringify({ prompt: 'Analyze this', model: 'claude-sonnet-4-20250514', output_length: 'middle' }),
      }
      const result = await handler(event)
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toBe('Missing content or prompt')
    })

    it('should reject missing prompt', async () => {
      const event = {
        httpMethod: 'POST',
        headers: { 'x-forwarded-for': '10.0.0.2' },
        body: JSON.stringify({ content: 'Some content', model: 'claude-sonnet-4-20250514', output_length: 'middle' }),
      }
      const result = await handler(event)
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toBe('Missing content or prompt')
    })

    it('should reject content exceeding 50000 characters', async () => {
      const event = makeEvent({
        content: 'x'.repeat(50001),
        _event: { headers: { 'x-forwarded-for': '10.0.0.3' } },
      })
      const result = await handler(event)
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toContain('too large')
    })

    it('should accept content at exactly 50000 characters', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          content: [{ text: 'Analysis' }],
          usage: { input_tokens: 10, output_tokens: 20 },
        },
      })
      const event = makeEvent({
        content: 'x'.repeat(50000),
        _event: { headers: { 'x-forwarded-for': '10.0.0.4' } },
      })
      const result = await handler(event)
      expect(result.statusCode).toBe(200)
    })
  })

  // ==========================================================================
  // Temperature and max_tokens clamping
  // ==========================================================================
  describe('Parameter normalization', () => {
    it('should clamp temperature to [0, 1]', async () => {
      axios.post.mockResolvedValueOnce({
        data: { content: [{ text: 'Result' }], usage: {} },
      })

      const event = makeEvent({
        temperature: 5.0,
        _event: { headers: { 'x-forwarded-for': '10.0.0.5' } },
      })
      await handler(event)

      const callArgs = axios.post.mock.calls[0][1]
      expect(callArgs.temperature).toBe(1)
    })

    it('should clamp negative temperature to 0', async () => {
      axios.post.mockResolvedValueOnce({
        data: { content: [{ text: 'Result' }], usage: {} },
      })

      const event = makeEvent({
        temperature: -1,
        _event: { headers: { 'x-forwarded-for': '10.0.0.6' } },
      })
      await handler(event)

      const callArgs = axios.post.mock.calls[0][1]
      expect(callArgs.temperature).toBe(0)
    })

    it('should cap max_tokens at 4096', async () => {
      axios.post.mockResolvedValueOnce({
        data: { content: [{ text: 'Result' }], usage: {} },
      })

      const event = makeEvent({
        max_tokens: 10000,
        _event: { headers: { 'x-forwarded-for': '10.0.0.7' } },
      })
      await handler(event)

      const callArgs = axios.post.mock.calls[0][1]
      expect(callArgs.max_tokens).toBe(4096)
    })
  })

  // ==========================================================================
  // API key validation
  // ==========================================================================
  describe('API key validation', () => {
    it('should return 500 when API key is missing', async () => {
      vi.resetModules()
      delete process.env.ANTHROPIC_API_KEY

      const mod = await import('../../netlify/functions/analyze.js')
      const event = makeEvent({ _event: { headers: { 'x-forwarded-for': '10.0.0.8' } } })
      const result = await mod.handler(event)
      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body).error).toBe('Server configuration error')
    })
  })

  // ==========================================================================
  // Successful analysis
  // ==========================================================================
  describe('Successful analysis', () => {
    it('should return analysis and usage on success', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          content: [{ text: '## Key Takeaways\n- Insight 1' }],
          usage: { input_tokens: 100, output_tokens: 50 },
        },
      })

      const event = makeEvent({ _event: { headers: { 'x-forwarded-for': '10.0.0.9' } } })
      const result = await handler(event)
      const body = JSON.parse(result.body)

      expect(result.statusCode).toBe(200)
      expect(body.analysis).toContain('Key Takeaways')
      expect(body.usage.input_tokens).toBe(100)
      expect(body.usage.output_tokens).toBe(50)
    })

    it('should include structured format for middle output', async () => {
      axios.post.mockResolvedValueOnce({
        data: { content: [{ text: 'Result' }], usage: {} },
      })

      const event = makeEvent({
        output_length: 'middle',
        _event: { headers: { 'x-forwarded-for': '10.0.0.10' } },
      })
      await handler(event)

      const system = axios.post.mock.calls[0][1].system
      expect(system).toContain('## Key Takeaways')
      expect(system).toContain('## Analysis')
      expect(system).toContain('## Action Steps')
    })

    it('should NOT include structured format for summary output', async () => {
      axios.post.mockResolvedValueOnce({
        data: { content: [{ text: 'Result' }], usage: {} },
      })

      const event = makeEvent({
        output_length: 'summary',
        _event: { headers: { 'x-forwarded-for': '10.0.0.11' } },
      })
      await handler(event)

      const system = axios.post.mock.calls[0][1].system
      expect(system).not.toContain('## Key Takeaways')
      expect(system).toContain('3-5 bullet points')
    })
  })

  // ==========================================================================
  // Error handling
  // ==========================================================================
  describe('Error handling', () => {
    it('should handle API errors with status code', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: { message: 'Invalid API key' } },
        },
      })

      const event = makeEvent({ _event: { headers: { 'x-forwarded-for': '10.0.0.12' } } })
      const result = await handler(event)

      expect(result.statusCode).toBe(401)
      expect(JSON.parse(result.body).error).toBe('Invalid API key')
    })

    it('should handle timeout errors', async () => {
      axios.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
      })

      const event = makeEvent({ _event: { headers: { 'x-forwarded-for': '10.0.0.13' } } })
      const result = await handler(event)

      expect(result.statusCode).toBe(504)
      expect(JSON.parse(result.body).error).toBe('Request timeout')
    })

    it('should handle empty analysis response', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          content: [{ text: '' }],
          usage: {},
        },
      })

      const event = makeEvent({ _event: { headers: { 'x-forwarded-for': '10.0.0.14' } } })
      const result = await handler(event)
      // Empty string is falsy, so handler throws 'No analysis generated'
      expect(result.statusCode).toBe(500)
    })

    it('should handle null content array', async () => {
      axios.post.mockResolvedValueOnce({
        data: { content: [], usage: {} },
      })

      const event = makeEvent({ _event: { headers: { 'x-forwarded-for': '10.0.0.15' } } })
      const result = await handler(event)
      expect(result.statusCode).toBe(500)
    })
  })

  // ==========================================================================
  // Rate limiting
  // ==========================================================================
  describe('Rate limiting', () => {
    it('should allow requests within rate limit', async () => {
      axios.post.mockResolvedValue({
        data: { content: [{ text: 'Result' }], usage: {} },
      })

      // First request should work
      const event = makeEvent({ _event: { headers: { 'x-forwarded-for': '192.168.1.1' } } })
      const result = await handler(event)
      expect(result.statusCode).toBe(200)
    })

    it('should block requests exceeding rate limit', async () => {
      axios.post.mockResolvedValue({
        data: { content: [{ text: 'Result' }], usage: {} },
      })

      // Make 10 requests (the limit)
      const ip = '192.168.1.100'
      for (let i = 0; i < 10; i++) {
        await handler(makeEvent({ _event: { headers: { 'x-forwarded-for': ip } } }))
      }

      // 11th request should be rate limited
      const result = await handler(makeEvent({ _event: { headers: { 'x-forwarded-for': ip } } }))
      expect(result.statusCode).toBe(429)
      expect(JSON.parse(result.body).error).toContain('Rate limit exceeded')
    })

    it('should rate limit per IP independently', async () => {
      axios.post.mockResolvedValue({
        data: { content: [{ text: 'Result' }], usage: {} },
      })

      // Exhaust rate limit for IP1
      const ip1 = '192.168.2.1'
      for (let i = 0; i < 10; i++) {
        await handler(makeEvent({ _event: { headers: { 'x-forwarded-for': ip1 } } }))
      }

      // IP2 should still work
      const ip2 = '192.168.2.2'
      const result = await handler(makeEvent({ _event: { headers: { 'x-forwarded-for': ip2 } } }))
      expect(result.statusCode).toBe(200)
    })
  })
})
