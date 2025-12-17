import { DEV_TITLE_KEYWORDS, isDevDocument } from '@/config/devKeywords'

export function useDocumentClassifier() {
  // Classify a single document by title
  const classifyDocument = (document) => {
    return {
      ...document,
      isDevDoc: isDevDocument(document.name),
    }
  }

  // Filter documents to only dev-related ones
  const filterDevDocuments = (documents) => {
    return documents.filter(doc => isDevDocument(doc.name))
  }

  // Classify all documents and return with classification
  const classifyAllDocuments = (documents) => {
    return documents.map(classifyDocument)
  }

  // Get classification stats
  const getClassificationStats = (documents) => {
    const classified = classifyAllDocuments(documents)
    const devDocs = classified.filter(doc => doc.isDevDoc)

    return {
      total: documents.length,
      devDocuments: devDocs.length,
      otherDocuments: documents.length - devDocs.length,
    }
  }

  // Extract matching keywords from title (for debugging/display)
  const getMatchingKeywords = (title) => {
    if (!title) return []
    const lowerTitle = title.toLowerCase()
    return DEV_TITLE_KEYWORDS.filter(keyword =>
      lowerTitle.includes(keyword.toLowerCase())
    )
  }

  return {
    classifyDocument,
    filterDevDocuments,
    classifyAllDocuments,
    getClassificationStats,
    getMatchingKeywords,
  }
}
