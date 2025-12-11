/**
 * Affiliate partner configurations for professional recommendations
 * These are therapy/coaching platforms with affiliate programs
 */

export const AFFILIATE_PARTNERS = {
  betterhelp: {
    id: 'betterhelp',
    name: 'BetterHelp',
    type: 'therapy',
    description: 'Professional online therapy with licensed therapists',
    features: [
      'Licensed, accredited therapists',
      'Unlimited messaging',
      'Weekly video/phone sessions',
      'Switch therapists anytime'
    ],
    priceRange: '$60-90/week',
    // Replace with your actual affiliate link
    affiliateUrl: 'https://www.betterhelp.com/start/?go=true',
    icon: '🧠',
    color: 'cyan',
    matchKeywords: ['depression', 'depressed', 'anxiety', 'anxious', 'therapy', 'therapist', 'mental health', 'trauma', 'grief', 'loss', 'panic', 'stress'],
    priority: 1,
  },

  talkspace: {
    id: 'talkspace',
    name: 'Talkspace',
    type: 'therapy',
    description: 'Text, audio & video therapy on your schedule',
    features: [
      'Message your therapist anytime',
      'Live video sessions available',
      'Psychiatry services available',
      'Insurance accepted'
    ],
    priceRange: '$65-100/week',
    affiliateUrl: 'https://www.talkspace.com/',
    icon: '💬',
    color: 'pink',
    matchKeywords: ['depression', 'anxiety', 'therapy', 'counseling', 'mental health', 'psychiatrist', 'medication'],
    priority: 2,
  },

  noom: {
    id: 'noom',
    name: 'Noom',
    type: 'coaching',
    description: 'Psychology-based wellness coaching for lasting change',
    features: [
      'Personalized coaching',
      'Daily lessons & activities',
      'Food logging & tracking',
      'Community support'
    ],
    priceRange: '$59/month',
    affiliateUrl: 'https://www.noom.com/',
    icon: '🌱',
    color: 'lime',
    matchKeywords: ['goals', 'habits', 'weight', 'health', 'diet', 'exercise', 'motivation', 'productivity', 'self-improvement', 'discipline'],
    priority: 3,
  },

  headspace: {
    id: 'headspace',
    name: 'Headspace',
    type: 'mindfulness',
    description: 'Meditation and mindfulness for everyday life',
    features: [
      'Guided meditations',
      'Sleep content',
      'Focus music',
      'Stress relief exercises'
    ],
    priceRange: '$12.99/month',
    affiliateUrl: 'https://www.headspace.com/',
    icon: '🧘',
    color: 'cyan',
    matchKeywords: ['stress', 'sleep', 'insomnia', 'meditation', 'mindfulness', 'calm', 'relax', 'focus', 'anxiety'],
    priority: 4,
  },

  psychologyToday: {
    id: 'psychologyToday',
    name: 'Psychology Today',
    type: 'directory',
    description: 'Find local therapists in your area',
    features: [
      'Search by location',
      'Filter by specialty',
      'Read therapist profiles',
      'In-person or online options'
    ],
    priceRange: 'Varies',
    affiliateUrl: 'https://www.psychologytoday.com/us/therapists',
    icon: '📍',
    color: 'pink',
    matchKeywords: ['local', 'in-person', 'therapist near me', 'find therapist'],
    priority: 5,
  },
}

/**
 * Recommendation types with descriptions
 */
export const RECOMMENDATION_TYPES = {
  therapy: {
    label: 'Professional Therapy',
    description: 'Connect with licensed mental health professionals',
    icon: '🧠',
  },
  coaching: {
    label: 'Wellness Coaching',
    description: 'Goal-oriented support for personal development',
    icon: '🎯',
  },
  mindfulness: {
    label: 'Mindfulness & Meditation',
    description: 'Tools for stress reduction and mental clarity',
    icon: '🧘',
  },
  directory: {
    label: 'Find Local Help',
    description: 'Search for professionals in your area',
    icon: '📍',
  },
}

/**
 * Keywords that suggest professional help might be beneficial
 * Used for smart matching
 */
export const CONCERN_KEYWORDS = {
  highPriority: [
    'suicidal', 'suicide', 'self-harm', 'hurt myself', 'end it all',
    'hopeless', 'worthless', 'no point', 'give up'
  ],
  therapy: [
    'depressed', 'depression', 'anxious', 'anxiety', 'panic',
    'trauma', 'ptsd', 'abuse', 'grief', 'loss', 'therapy',
    'mental health', 'disorder', 'diagnosis'
  ],
  coaching: [
    'goals', 'motivation', 'stuck', 'productivity', 'habits',
    'career', 'direction', 'purpose', 'improve', 'change',
    'discipline', 'procrastination'
  ],
  mindfulness: [
    'stress', 'overwhelmed', 'sleep', 'insomnia', 'racing thoughts',
    'calm', 'relax', 'meditation', 'mindful', 'focus'
  ],
  relationships: [
    'relationship', 'partner', 'marriage', 'divorce', 'dating',
    'lonely', 'isolated', 'communication', 'conflict'
  ]
}

/**
 * Match analysis content to appropriate recommendations
 */
export function matchRecommendations(analysisText) {
  const text = analysisText.toLowerCase()
  const recommendations = []
  const matched = new Set()

  // Check for high priority keywords first
  const hasHighPriority = CONCERN_KEYWORDS.highPriority.some(kw =>
    text.includes(kw)
  )

  if (hasHighPriority) {
    // Always recommend professional help for serious concerns
    recommendations.push({
      ...AFFILIATE_PARTNERS.betterhelp,
      urgent: true,
      reason: 'Based on your writing, speaking with a professional could be helpful'
    })
    matched.add('betterhelp')
  }

  // Match partners based on keywords
  Object.values(AFFILIATE_PARTNERS).forEach(partner => {
    if (matched.has(partner.id)) return

    const matchScore = partner.matchKeywords.filter(kw =>
      text.includes(kw)
    ).length

    if (matchScore > 0) {
      recommendations.push({
        ...partner,
        matchScore,
        reason: getRecommendationReason(partner.type, matchScore)
      })
      matched.add(partner.id)
    }
  })

  // Sort by priority and match score
  return recommendations
    .sort((a, b) => {
      if (a.urgent) return -1
      if (b.urgent) return 1
      return (b.matchScore || 0) - (a.matchScore || 0) || a.priority - b.priority
    })
    .slice(0, 3) // Limit to top 3 recommendations
}

/**
 * Generate reason text for recommendation
 */
function getRecommendationReason(type, matchScore) {
  const reasons = {
    therapy: matchScore > 2
      ? 'Your writing suggests professional support could be valuable'
      : 'Therapy can provide helpful tools and perspectives',
    coaching: matchScore > 2
      ? 'A coach could help you achieve the goals you mentioned'
      : 'Coaching can help with motivation and direction',
    mindfulness: matchScore > 2
      ? 'Mindfulness practices could help with the stress patterns you described'
      : 'Meditation can support overall wellbeing',
    directory: 'Find a local professional who specializes in your needs'
  }
  return reasons[type] || 'This resource might be helpful for you'
}

/**
 * Free resources to always include
 */
export const FREE_RESOURCES = [
  {
    name: 'Crisis Text Line',
    description: 'Free 24/7 crisis support via text',
    action: 'Text HOME to 741741',
    type: 'crisis',
    icon: '💬'
  },
  {
    name: '7 Cups',
    description: 'Free online chat with trained listeners',
    url: 'https://www.7cups.com/',
    type: 'support',
    icon: '☕'
  },
  {
    name: 'Woebot',
    description: 'Free AI chatbot for mental health support',
    url: 'https://woebothealth.com/',
    type: 'tool',
    icon: '🤖'
  }
]

/**
 * Affiliate disclosure text (required for transparency)
 */
export const AFFILIATE_DISCLOSURE = "Some links may be affiliate links. We may earn a commission at no extra cost to you. This helps support the app while providing you with quality resources."
