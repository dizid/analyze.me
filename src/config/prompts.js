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
    id: 'email-communication',
    label: 'Email Communication Analysis',
    icon: '📧',
    sources: ['gmail'],
    prompt: `Analyze this email communication data to understand patterns and style:

COMMUNICATION PATTERNS:
- Overall communication tone and formality level
- Common themes and topics in email subjects
- Ratio of sent vs received emails and what it suggests
- Professional vs personal communication balance

BEHAVIORAL INSIGHTS:
- Response patterns and engagement levels
- Peak communication periods
- Signs of stress or overwhelm from work emails
- Quality and clarity of communication

RECOMMENDATIONS:
- Tips for improving email communication
- Time management suggestions for email
- Potential areas of communication improvement

Provide actionable insights based on the email patterns observed.`,
  },
  {
    id: 'music-mood',
    label: 'Music Mood Analysis',
    icon: '🎵',
    sources: ['spotify'],
    prompt: `Analyze this Spotify listening data to understand emotional and psychological patterns:

MOOD ANALYSIS:
- What emotional state does the music choice suggest?
- Are you using music for regulation (energizing, calming, processing)?
- What does the happiness/energy balance reveal about current mindset?
- Any concerning patterns (constant sad music, using music to escape)?

PERSONALITY INSIGHTS:
- What do genre preferences reveal about personality traits?
- Are listening habits diverse or focused?
- What does tempo preference suggest about energy levels?
- How does music taste align with self-perception?

BEHAVIORAL PATTERNS:
- When do you listen most? (time of day patterns)
- Is music being used productively or as avoidance?
- Are there any addictive listening patterns?

RECOMMENDATIONS:
- Mood-boosting playlist suggestions based on current patterns
- How to use music more intentionally for emotional wellbeing
- Balance suggestions for music diet
- Mindful listening practices

Be psychologically insightful while remaining supportive.`,
  },
  {
    id: 'work-life-balance',
    label: 'Work-Life Balance Analysis',
    icon: '📅',
    sources: ['calendar'],
    prompt: `Analyze this calendar data to assess work-life balance and time management:

TIME ALLOCATION:
- Distribution of work vs personal events
- Average meeting load and its sustainability
- Weekend and after-hours commitments
- Balance between structured and free time

POTENTIAL CONCERNS:
- Signs of burnout (excessive meetings, no breaks)
- Work encroaching on personal time
- Early morning or late evening events
- Meeting overload indicators

PATTERNS & INSIGHTS:
- Busiest days and peak productivity windows
- Time blocking effectiveness
- Buffer time between commitments
- Recurring vs one-time events ratio

RECOMMENDATIONS:
- Specific strategies to improve balance
- Suggested time blocks for focus work
- Ways to protect personal time
- Meeting hygiene tips

Be direct about any concerning patterns while offering constructive solutions.`,
  },
  {
    id: 'developer-wellness',
    label: 'Developer Wellness Analysis',
    icon: '🐙',
    sources: ['github'],
    prompt: `Analyze this GitHub activity data to assess developer wellness, productivity patterns, and potential burnout risk:

WORK PATTERNS:
- Peak coding hours and what they suggest about work style
- Weekend and late-night commit patterns - are these concerning?
- Activity density and consistency over time
- Balance between different types of work (commits, PRs, issues)

BURNOUT ASSESSMENT:
- Evaluate the burnout risk score and supporting evidence
- Signs of overwork or unhealthy coding habits
- Quality vs quantity indicators in commit messages
- Rest periods and recovery patterns

TECHNICAL INSIGHTS:
- Language diversity and what it suggests about skill breadth
- Project variety and learning patterns
- Collaboration indicators (PRs, issues, team activity)
- Repository management and organization style

DEVELOPER PERSONALITY:
- Coding style preferences from commit patterns
- Problem-solving approach (quick commits vs large changes)
- Communication style in commit messages
- Perfectionist vs pragmatist tendencies

RECOMMENDATIONS:
- Specific strategies to improve developer wellbeing
- Work-life balance suggestions for coders
- Productivity optimization tips based on natural patterns
- Ways to maintain sustainable coding practices

Be honest about concerning patterns while providing supportive, actionable advice.`,
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
