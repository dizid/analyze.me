import { describe, it, expect } from 'vitest'
import { ANALYSIS_PROMPTS, getPromptById, getPromptText } from '@/config/prompts'

// =============================================================================
// ANALYSIS_PROMPTS array
// =============================================================================
describe('ANALYSIS_PROMPTS', () => {
  it('should have 9 prompts', () => {
    expect(ANALYSIS_PROMPTS).toHaveLength(9)
  })

  it('should have required fields on every prompt', () => {
    ANALYSIS_PROMPTS.forEach((prompt) => {
      expect(prompt).toHaveProperty('id')
      expect(prompt).toHaveProperty('label')
      expect(prompt).toHaveProperty('icon')
      expect(prompt).toHaveProperty('prompt')
      expect(typeof prompt.id).toBe('string')
      expect(typeof prompt.prompt).toBe('string')
      expect(prompt.prompt.length).toBeGreaterThan(10)
    })
  })

  it('should have unique ids', () => {
    const ids = ANALYSIS_PROMPTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should have expected prompt ids', () => {
    const ids = ANALYSIS_PROMPTS.map((p) => p.id)
    expect(ids).toContain('themes')
    expect(ids).toContain('sentiment')
    expect(ids).toContain('improvement')
    expect(ids).toContain('strengths-weaknesses')
    expect(ids).toContain('goals')
    expect(ids).toContain('music-mood')
    expect(ids).toContain('developer-wellness')
    expect(ids).toContain('work-life-balance')
    expect(ids).toContain('email-communication')
  })

  it('should require specific sources for source-specific prompts', () => {
    const musicMood = ANALYSIS_PROMPTS.find((p) => p.id === 'music-mood')
    expect(musicMood.sources).toContain('spotify')

    const devWellness = ANALYSIS_PROMPTS.find((p) => p.id === 'developer-wellness')
    expect(devWellness.sources).toContain('github')

    const workLife = ANALYSIS_PROMPTS.find((p) => p.id === 'work-life-balance')
    expect(workLife.sources).toContain('calendar')

    const emailComm = ANALYSIS_PROMPTS.find((p) => p.id === 'email-communication')
    expect(emailComm.sources).toContain('gmail')
  })

  it('should NOT have sources on generic prompts', () => {
    const themes = ANALYSIS_PROMPTS.find((p) => p.id === 'themes')
    expect(themes.sources).toBeUndefined()

    const sentiment = ANALYSIS_PROMPTS.find((p) => p.id === 'sentiment')
    expect(sentiment.sources).toBeUndefined()
  })
})

// =============================================================================
// getPromptById()
// =============================================================================
describe('getPromptById', () => {
  it('should return prompt by id', () => {
    const prompt = getPromptById('themes')
    expect(prompt).toBeDefined()
    expect(prompt.label).toBe('Summarize Key Personal Themes')
  })

  it('should return undefined for unknown id', () => {
    expect(getPromptById('nonexistent')).toBeUndefined()
  })
})

// =============================================================================
// getPromptText()
// =============================================================================
describe('getPromptText', () => {
  it('should return prompt text by id', () => {
    const text = getPromptText('themes')
    expect(text).toContain('key themes')
  })

  it('should return empty string for unknown id', () => {
    expect(getPromptText('nonexistent')).toBe('')
  })
})
