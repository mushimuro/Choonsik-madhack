import { PDFDocument } from 'pdf-lib'

/**
 * PDF Service
 * Handles PDF manipulation operations
 * NOTE: This service provides utility functions for PDF handling.
 * The actual PDF form filling implementation will depend on whether
 * the tax forms are fillable PDFs or require other approaches.
 */
class PDFService {
  /**
   * Load a PDF document from URL or file
   */
  async loadPDF(source) {
    try {
      let arrayBuffer

      if (typeof source === 'string') {
        // Load from URL
        const response = await fetch(source)
        arrayBuffer = await response.arrayBuffer()
      } else if (source instanceof File) {
        // Load from File object
        arrayBuffer = await source.arrayBuffer()
      } else if (source instanceof ArrayBuffer) {
        // Already an ArrayBuffer
        arrayBuffer = source
      } else {
        throw new Error('Invalid source type')
      }

      return await PDFDocument.load(arrayBuffer)
    } catch (error) {
      throw new Error(`Error loading PDF: ${error.message}`)
    }
  }

  /**
   * Check if PDF has fillable form fields
   * This will help determine if the tax form PDF is fillable
   */
  async checkIfFillable(pdfSource) {
    try {
      const pdfDoc = await this.loadPDF(pdfSource)
      const form = pdfDoc.getForm()
      const fields = form.getFields()
      
      return {
        isFillable: fields.length > 0,
        fieldCount: fields.length,
        fields: fields.map(field => ({
          name: field.getName(),
          type: field.constructor.name,
        })),
      }
    } catch (error) {
      return {
        isFillable: false,
        fieldCount: 0,
        fields: [],
        error: error.message,
      }
    }
  }

  /**
   * Get form fields from a fillable PDF
   */
  async getFormFields(pdfSource) {
    try {
      const pdfDoc = await this.loadPDF(pdfSource)
      const form = pdfDoc.getForm()
      const fields = form.getFields()
      
      return fields.map(field => {
        const fieldName = field.getName()
        const fieldType = field.constructor.name
        
        // Get detailed field properties
        const fieldInfo = {
          name: fieldName,
          type: fieldType,
          value: this.getFieldValue(field, fieldType),
        }
        
        // Add text field specific properties
        if (fieldType === 'PDFTextField' || fieldType === 'PDFTextField2') {
          try {
            fieldInfo.maxLength = field.getMaxLength() || 'unlimited'
            fieldInfo.isReadOnly = field.isReadOnly()
            fieldInfo.isRequired = field.isRequired()
            fieldInfo.alignment = field.getAlignment()
          } catch (e) {
            // Some methods might not be available
            fieldInfo.propertiesError = e.message
          }
        }
        
        // Add checkbox specific properties
        if (fieldType === 'PDFCheckBox' || fieldType === 'PDFCheckBox2') {
          try {
            fieldInfo.isReadOnly = field.isReadOnly()
            fieldInfo.isRequired = field.isRequired()
          } catch (e) {
            fieldInfo.propertiesError = e.message
          }
        }
        
        return fieldInfo
      })
    } catch (error) {
      throw new Error(`Error getting form fields: ${error.message}`)
    }
  }

  /**
   * Get field value based on field type
   */
  getFieldValue(field, fieldType) {
    try {
      switch (fieldType) {
        case 'PDFTextField':
          return field.getText() || ''
        case 'PDFCheckBox':
          return field.isChecked()
        case 'PDFRadioGroup':
          return field.getSelected() || ''
        case 'PDFDropdown':
          return field.getSelected() || []
        default:
          return null
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Fill PDF form fields (for fillable PDFs)
   * This is a placeholder implementation
   */
  async fillPDFForm(pdfSource, formData) {
    try {
      const pdfDoc = await this.loadPDF(pdfSource)
      const form = pdfDoc.getForm()

      // Iterate through form data and fill fields
      let filledCount = 0
      let errorCount = 0
      
      Object.keys(formData).forEach(fieldName => {
        try {
          const field = form.getField(fieldName)
          const fieldType = field.constructor.name
          const value = formData[fieldName]

          switch (fieldType) {
            case 'PDFTextField':
            case 'PDFTextField2':  // Some PDFs use PDFTextField2
              field.setText(String(value))
              filledCount++
              console.log(`✅ Filled ${fieldName} = "${value}"`)
              break
            case 'PDFCheckBox':
            case 'PDFCheckBox2':   // Some PDFs use PDFCheckBox2
              // Handle checkboxes with export values (for checkbox groups)
              if (typeof value === 'string' && value !== 'Yes' && value !== 'No') {
                // Try to select a specific export value (for checkbox groups)
                try {
                  field.check(value)
                  filledCount++
                  console.log(`✅ Filled ${fieldName} with export value = "${value}"`)
                } catch (e) {
                  // Fallback to simple check/uncheck
                  if (value) {
                    field.check()
                  } else {
                    field.uncheck()
                  }
                  filledCount++
                  console.log(`✅ Filled ${fieldName} = ${value}`)
                }
              } else {
                // Simple boolean check/uncheck
                if (value) {
                  field.check()
                } else {
                  field.uncheck()
                }
                filledCount++
                console.log(`✅ Filled ${fieldName} = ${value}`)
              }
              break
            case 'PDFRadioGroup':
              field.select(value)
              filledCount++
              console.log(`✅ Filled ${fieldName} = "${value}"`)
              break
            case 'PDFDropdown':
              field.select(value)
              filledCount++
              console.log(`✅ Filled ${fieldName} = "${value}"`)
              break
            case 'PDFButton':
            case 'PDFButton2':
              // Skip buttons
              break
            default:
              console.warn(`⚠️ Unknown field type: ${fieldType}`)
          }
        } catch (fieldError) {
          errorCount++
          console.warn(`❌ Error filling field ${fieldName}:`, fieldError.message)
        }
      })
      
      console.log(`📊 Summary: ${filledCount} fields filled, ${errorCount} errors`)

      // Flatten form to make it non-editable (optional)
      // form.flatten()

      return pdfDoc
    } catch (error) {
      throw new Error(`Error filling PDF form: ${error.message}`)
    }
  }

  /**
   * Save PDF document as blob
   */
  async savePDFAsBlob(pdfDoc) {
    try {
      const pdfBytes = await pdfDoc.save()
      return new Blob([pdfBytes], { type: 'application/pdf' })
    } catch (error) {
      throw new Error(`Error saving PDF: ${error.message}`)
    }
  }

  /**
   * Download PDF document
   */
  async downloadPDF(pdfDoc, filename = 'form.pdf') {
    try {
      const blob = await this.savePDFAsBlob(pdfDoc)
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      
      // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(`Error downloading PDF: ${error.message}`)
    }
  }

  /**
   * Merge multiple PDFs
   */
  async mergePDFs(pdfSources) {
    try {
      const mergedPdf = await PDFDocument.create()

      for (const source of pdfSources) {
        const pdfDoc = await this.loadPDF(source)
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      }

      return mergedPdf
    } catch (error) {
      throw new Error(`Error merging PDFs: ${error.message}`)
    }
  }

  /**
   * Add text overlay to PDF (alternative approach for non-fillable PDFs)
   */
  async addTextOverlay(pdfSource, textOverlays) {
    try {
      const pdfDoc = await this.loadPDF(pdfSource)
      const pages = pdfDoc.getPages()

      textOverlays.forEach(overlay => {
        const { pageIndex, text, x, y, size = 12, color = { r: 0, g: 0, b: 0 } } = overlay
        const page = pages[pageIndex]
        
        page.drawText(text, {
          x,
          y,
          size,
          color,
        })
      })

      return pdfDoc
    } catch (error) {
      throw new Error(`Error adding text overlay: ${error.message}`)
    }
  }

  /**
   * Get PDF metadata
   */
  async getPDFMetadata(pdfSource) {
    try {
      const pdfDoc = await this.loadPDF(pdfSource)
      
      return {
        pageCount: pdfDoc.getPageCount(),
        title: pdfDoc.getTitle() || 'Untitled',
        author: pdfDoc.getAuthor() || 'Unknown',
        subject: pdfDoc.getSubject() || '',
        creator: pdfDoc.getCreator() || '',
        producer: pdfDoc.getProducer() || '',
        creationDate: pdfDoc.getCreationDate(),
        modificationDate: pdfDoc.getModificationDate(),
      }
    } catch (error) {
      throw new Error(`Error getting PDF metadata: ${error.message}`)
    }
  }
}

export default new PDFService()

