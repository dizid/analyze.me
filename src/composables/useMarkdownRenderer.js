import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function useMarkdownRenderer() {
  // Configure marked
  marked.setOptions({
    breaks: true,
    gfm: true, // GitHub Flavored Markdown
    headerIds: true,
    mangle: false,
  })

  const renderMarkdown = (content) => {
    if (!content) return ''

    // First, parse markdown to HTML
    const rawHtml = marked.parse(content)

    // Then sanitize with DOMPurify
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 's', 'del',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    })

    return cleanHtml
  }

  const createRenderer = (content) => {
    return computed(() => renderMarkdown(content))
  }

  return {
    renderMarkdown,
    createRenderer,
  }
}
