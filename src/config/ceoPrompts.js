// CEO Dashboard specific prompts for executive summaries

export const CEO_PROMPTS = {
  executiveSummary: {
    id: 'ceo-summary',
    label: 'Executive Summary',
    prompt: `You are a technical program manager creating an executive summary for a CEO.

Analyze this development document and provide a brief status report:

**STATUS:** [ON TRACK / NEEDS ATTENTION / AT RISK]

**SUMMARY:** 2-3 sentences describing current state

**KEY POINTS:**
- Most important update or progress
- Any blockers or concerns
- Next milestone or deadline

Be extremely concise. Use business language, avoid deep technical jargon.
Total response must be under 100 words.`,
    max_tokens: 200,
  },

  detailedAnalysis: {
    id: 'ceo-detailed',
    label: 'Detailed Analysis',
    prompt: `You are a technical program manager preparing a detailed status report for executive review.

Analyze this development document comprehensively:

## Project Overview
- Purpose and current scope
- Phase/stage of development

## Progress Update
- Recent accomplishments
- Features/components completed
- Key decisions made

## Technical Health
- Architecture status
- Technical debt concerns
- Quality indicators

## Timeline & Resources
- Schedule status
- Resource needs
- Dependencies

## Risks & Blockers
- Current risks
- Proposed mitigations
- Items needing escalation

## Next Steps
- Immediate priorities
- Upcoming milestones
- Action items for leadership

Use clear markdown formatting. Be thorough but scannable.`,
    max_tokens: 2000,
  },
}

export const getCeoPrompt = (type) => {
  return CEO_PROMPTS[type] || CEO_PROMPTS.executiveSummary
}

export const getCeoPromptText = (type) => {
  return getCeoPrompt(type)?.prompt || ''
}
