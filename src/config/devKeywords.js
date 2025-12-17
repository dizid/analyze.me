// Keywords to identify programming/development documents by title
export const DEV_TITLE_KEYWORDS = [
  // Project types
  'app', 'application', 'project', 'feature', 'sprint', 'epic', 'mvp',
  // Technical terms
  'api', 'backend', 'frontend', 'database', 'db', 'deploy', 'deployment',
  'release', 'bug', 'fix', 'refactor', 'migration', 'integration',
  'server', 'client', 'microservice', 'service', 'module',
  // Dev processes
  'spec', 'specification', 'requirements', 'architecture', 'design doc',
  'prd', 'rfc', 'adr', 'technical', 'implementation', 'proposal',
  // Languages/frameworks
  'react', 'vue', 'node', 'python', 'typescript', 'javascript',
  'java', 'golang', 'rust', 'swift', 'kotlin', 'flutter',
  // Project management
  'roadmap', 'milestone', 'standup', 'retro', 'retrospective',
  'dev log', 'devlog', 'changelog', 'backlog', 'kanban',
  // Infrastructure
  'docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'ci/cd', 'pipeline',
  // Common dev doc names
  'readme', 'todo', 'notes', 'planning', 'brainstorm', 'code review',
  'testing', 'test plan', 'qa', 'debug', 'troubleshoot',
]

// Check if a document title matches dev keywords
export const isDevDocument = (title) => {
  if (!title) return false
  const lowerTitle = title.toLowerCase()
  return DEV_TITLE_KEYWORDS.some(keyword =>
    lowerTitle.includes(keyword.toLowerCase())
  )
}

// Status keywords to help AI determine project health
export const STATUS_KEYWORDS = {
  green: ['completed', 'shipped', 'launched', 'on track', 'ahead', 'done', 'success', 'delivered'],
  yellow: ['blocked', 'delayed', 'waiting', 'pending', 'review', 'attention', 'concern', 'risk'],
  red: ['failed', 'critical', 'urgent', 'overdue', 'stopped', 'cancelled', 'major issue', 'broken'],
}
