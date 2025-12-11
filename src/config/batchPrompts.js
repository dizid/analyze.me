/**
 * Prompts optimized for batch/bulk content analysis
 * (e.g., multiple tweets, journal entries, social media posts)
 */

export const BATCH_ANALYSIS_PROMPTS = [
  {
    id: 'batch-themes',
    label: 'Identify Patterns & Themes',
    icon: '🎯',
    prompt: `Analyze this collection of personal writings/posts and identify overarching patterns and themes.

Focus on:
- Recurring topics or subjects across multiple entries
- Common concerns, interests, or preoccupations
- Evolution of themes over time (if dates are present)
- Central values or beliefs expressed throughout

Provide a comprehensive summary with specific examples from the text. Note any patterns that stand out or themes that appear repeatedly.`,
  },
  {
    id: 'batch-emotional',
    label: 'Emotional Journey Analysis',
    icon: '💭',
    prompt: `Perform an emotional and psychological analysis of this collection of writings/posts.

Analyze:
- Overall emotional tone across all entries
- Emotional shifts and patterns over time
- Dominant emotions (joy, anxiety, frustration, hope, etc.)
- Emotional triggers or recurring situations that cause reactions
- Signs of growth, struggle, or stability
- Coping mechanisms expressed

Present findings as an emotional narrative, highlighting key moments and overall psychological trends.`,
  },
  {
    id: 'batch-growth',
    label: 'Personal Growth Assessment',
    icon: '🚀',
    prompt: `Based on this collection of writings/posts, assess personal growth and development areas.

Evaluate:
- Evidence of positive changes or growth
- Persistent challenges or areas needing attention
- Skills or strengths demonstrated
- Potential blind spots or patterns to address
- Opportunities for development

Provide actionable recommendations based on patterns observed. Be encouraging but honest about areas for improvement.`,
  },
  {
    id: 'batch-social',
    label: 'Social & Relationship Insights',
    icon: '👥',
    prompt: `Analyze the social and interpersonal aspects revealed in this collection of writings/posts.

Examine:
- How the author relates to others
- Relationship patterns (family, friends, colleagues, romantic)
- Communication style and social tendencies
- Social needs expressed (connection, validation, support)
- Conflicts or challenges in relationships
- Social strengths and areas for growth

Provide insights about social patterns and suggestions for healthier relationships.`,
  },
  {
    id: 'batch-comprehensive',
    label: 'Full Psychological Profile',
    icon: '🧠',
    prompt: `Create a comprehensive psychological profile based on this collection of writings/posts.

Include analysis of:

**Personality Traits:**
- Core personality characteristics evident
- Introversion vs. extroversion tendencies
- Decision-making patterns
- Response to stress

**Emotional Landscape:**
- Primary emotional states
- Emotional regulation abilities
- Triggers and coping mechanisms

**Cognitive Patterns:**
- Thinking styles (optimistic, realistic, pessimistic)
- Problem-solving approaches
- Self-talk patterns

**Values & Motivations:**
- Core values expressed
- Primary motivations
- Life priorities

**Recommendations:**
- Key strengths to leverage
- Areas for personal development
- Suggested next steps for growth

Be balanced, insightful, and constructive in the assessment.`,
  },
]

/**
 * System prompt enhancement for batch analysis
 * This is appended to the main system prompt when analyzing batched content
 */
export const BATCH_SYSTEM_CONTEXT = `
You are analyzing a collection of personal writings that may include:
- Journal entries
- Social media posts (Twitter, Reddit, etc.)
- Personal notes or thoughts
- Multiple entries over time

Important guidelines:
1. Look for PATTERNS across entries, not just individual insights
2. Note any evolution or changes over time if timestamps are present
3. Be sensitive to the personal nature of the content
4. Provide actionable, constructive feedback
5. When recommending professional help, be tactful and non-alarmist
6. Focus on empowerment and growth opportunities

Remember: You're helping someone understand themselves better through their own words.
`

export const getBatchPromptById = (id) => {
  return BATCH_ANALYSIS_PROMPTS.find(p => p.id === id)
}

export const getBatchPromptText = (id) => {
  return getBatchPromptById(id)?.prompt || ''
}
