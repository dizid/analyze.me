import { ref } from 'vue'
import html2pdf from 'html2pdf.js'

export function usePdfExport() {
  const isExporting = ref(false)
  const error = ref(null)

  const exportToPdf = async (element, filename = 'document.pdf') => {
    isExporting.value = true
    error.value = null

    try {
      const options = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }

      await html2pdf().set(options).from(element).save()
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
