export const ANALYSIS_PROMPTS = [
  {
    id: 'themes',
    label: 'Summarize Key Personal Themes',
    icon: '🎯',
    prompt: `Analyze this personal document and identify the key themes, recurring topics, and central ideas.
Focus on:
- Main subjects or areas of focus
- Recurring patterns or interests
- Core values or beliefs expressed
- Dominant emotions or perspectives

Provide a concise summary with specific examples from the text.`,
  },
  {
    id: 'sentiment',
    label: 'Analyze Mood and Sentiment',
    icon: '💭',
    prompt: `Perform a detailed sentiment and mood analysis of this document. Evaluate:
- Overall emotional tone (positive, negative, neutral, mixed)
- Shifts in mood throughout the text
- Emotional intensity and stability
- Underlying feelings or concerns
- Optimism vs. pessimism ratio

Present findings with emotional timeline and key emotional moments.`,
  },
  {
    id: 'improvement',
    label: 'Suggest Self-Improvement Actions',
    icon: '🚀',
    prompt: `Based on the content of this document, suggest actionable self-improvement recommendations:
- Areas for potential growth identified in the text
- Specific, actionable steps the author could take
- Resources or practices that might help
- Short-term and long-term development opportunities
- Patterns that could be optimized or changed

Provide practical, encouraging, and specific advice.`,
  },
  {
    id: 'strengths-weaknesses',
    label: 'Identify Strengths and Weaknesses',
    icon: '⚖️',
    prompt: `Conduct a balanced assessment of strengths and weaknesses revealed in this document:

STRENGTHS:
- Positive traits or capabilities
- Areas of competence or expertise
- Healthy habits or mindsets
- Personal advantages or resources

WEAKNESSES/CHALLENGES:
- Areas needing attention or development
- Limiting beliefs or patterns
- Obstacles or difficulties faced
- Gaps or inconsistencies

Be constructive and balanced in the assessment.`,
  },
  {
    id: 'goals',
    label: 'Extract Goals and Progress',
    icon: '📈',
    prompt: `Identify and analyze goals, aspirations, and progress indicators from this document:
- Explicit goals or objectives stated
- Implicit aspirations or desires
- Progress indicators or milestones mentioned
- Achievements or wins celebrated
- Obstacles to goal achievement
- Timeline or urgency indicators

Organize findings by goal category and assess progress status.`,
  },
]

export const getPromptById = (id) => {
  return ANALYSIS_PROMPTS.find(p => p.id === id)
}

export const getPromptText = (id) => {
  return getPromptById(id)?.prompt || ''
}
