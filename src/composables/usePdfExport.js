import { ref } from 'vue'
import html2pdf from 'html2pdf.js'

export function usePdfExport() {
  const isExporting = ref(false)
  const error = ref(null)

  const exportToPdf = async (element, filename = 'document.pdf') => {
    isExporting.value = true
    error.value = null

    try {
      // Create a clone with PDF-friendly styles (dark text on white background)
      const clone = element.cloneNode(true)
      clone.style.cssText = `
        background: white !important;
        color: #1a1a1a !important;
        padding: 20px !important;
        font-family: Arial, sans-serif !important;
        font-size: 12px !important;
        line-height: 1.6 !important;
        max-width: 800px !important;
      `

      // Apply PDF-friendly styles to all child elements
      const allElements = clone.querySelectorAll('*')
      allElements.forEach(el => {
        el.style.color = '#1a1a1a'
        el.style.backgroundColor = 'transparent'
        el.style.textShadow = 'none'
        el.style.boxShadow = 'none'
      })

      // Style headings
      clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
        el.style.color = '#0066cc'
        el.style.marginTop = '16px'
        el.style.marginBottom = '8px'
      })

      // Style strong/bold
      clone.querySelectorAll('strong, b').forEach(el => {
        el.style.color = '#333'
      })

      // Style code blocks
      clone.querySelectorAll('code, pre').forEach(el => {
        el.style.backgroundColor = '#f5f5f5'
        el.style.padding = '2px 4px'
        el.style.borderRadius = '3px'
        el.style.fontFamily = 'monospace'
      })

      // Style lists
      clone.querySelectorAll('ul, ol').forEach(el => {
        el.style.paddingLeft = '20px'
        el.style.marginBottom = '8px'
      })

      // Temporarily add to document (hidden)
      clone.style.position = 'absolute'
      clone.style.left = '-9999px'
      clone.style.top = '0'
      document.body.appendChild(clone)

      const options = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff',
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }

      await html2pdf().set(options).from(clone).save()

      // Clean up
      document.body.removeChild(clone)
    } catch (err) {
      console.error('PDF export error:', err)
      error.value = err.message
      throw err
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    error,
    exportToPdf,
  }
}
