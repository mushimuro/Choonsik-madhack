import pdfService from './pdfService'
import gcsPublicService from './gcsPublicService'
import { getFieldMapping, mapFormDataToPDF } from '../config/pdfFieldMappings'
import { TAX_FORMS } from '../constants/taxForms'

/**
 * PDF Filling Service
 * Handles the complete workflow of filling out tax form PDFs
 */
class PDFFillingService {
  /**
   * Fill a tax form PDF with user data
   * @param {string} formId - The form identifier (e.g., 'wi_form_1')
   * @param {object} formData - User form data
   * @param {object} options - Additional options
   * @returns {Promise<PDFDocument>} Filled PDF document
   */
  async fillTaxForm(formId, formData, options = {}) {
    try {
      // Get form configuration
      const formConfig = Object.values(TAX_FORMS).find(f => f.id === formId)
      if (!formConfig) {
        throw new Error(`Form configuration not found: ${formId}`)
      }
      
      // Get field mapping
      const fieldMapping = getFieldMapping(formId)
      if (!fieldMapping) {
        throw new Error(`No field mapping found for form: ${formId}`)
      }
      
      // Load the PDF template from GCS
      console.log(`Loading PDF template: ${formConfig.templateFile}`)
      const pdfUrl = gcsPublicService.getTemplateUrl(formConfig.templateFile)
      
      // Map form data to PDF field names
      console.log('Mapping form data to PDF fields...')
      const pdfFieldData = mapFormDataToPDF(formData, formId)
      
      console.log('PDF field data:', pdfFieldData)
      
      // Fill the PDF
      console.log('Filling PDF form...')
      const filledPDF = await pdfService.fillPDFForm(pdfUrl, pdfFieldData)
      
      // Optionally flatten the form (make it non-editable)
      if (options.flatten) {
        const form = filledPDF.getForm()
        form.flatten()
      }
      
      console.log('PDF filled successfully!')
      return filledPDF
      
    } catch (error) {
      console.error('Error filling tax form:', error)
      throw new Error(`Failed to fill tax form: ${error.message}`)
    }
  }
  
  /**
   * Fill and download a tax form
   * @param {string} formId - The form identifier
   * @param {object} formData - User form data
   * @param {string} filename - Download filename
   * @param {object} options - Additional options
   */
  async fillAndDownload(formId, formData, filename, options = {}) {
    try {
      const filledPDF = await this.fillTaxForm(formId, formData, options)
      await pdfService.downloadPDF(filledPDF, filename)
    } catch (error) {
      console.error('Error filling and downloading PDF:', error)
      throw error
    }
  }
  
  /**
   * Fill and return as blob for upload
   * @param {string} formId - The form identifier
   * @param {object} formData - User form data
   * @param {object} options - Additional options
   * @returns {Promise<Blob>} PDF blob
   */
  async fillAndGetBlob(formId, formData, options = {}) {
    try {
      const filledPDF = await this.fillTaxForm(formId, formData, options)
      return await pdfService.savePDFAsBlob(filledPDF)
    } catch (error) {
      console.error('Error filling PDF and creating blob:', error)
      throw error
    }
  }
  
  /**
   * Preview filled form (returns data URL)
   * @param {string} formId - The form identifier
   * @param {object} formData - User form data
   * @returns {Promise<string>} Data URL for preview
   */
  async getPreviewDataUrl(formId, formData) {
    try {
      const filledPDF = await this.fillTaxForm(formId, formData, { flatten: false })
      const blob = await pdfService.savePDFAsBlob(filledPDF)
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error generating PDF preview:', error)
      throw error
    }
  }
  
  /**
   * Validate that a form can be filled (has field mappings)
   * @param {string} formId - The form identifier
   * @returns {object} Validation result
   */
  validateFormCanBeFilled(formId) {
    const formConfig = Object.values(TAX_FORMS).find(f => f.id === formId)
    if (!formConfig) {
      return {
        canFill: false,
        reason: 'Form configuration not found',
      }
    }
    
    const fieldMapping = getFieldMapping(formId)
    if (!fieldMapping) {
      return {
        canFill: false,
        reason: 'No field mapping configured',
        suggestion: 'Use PDF Field Inspector to create field mappings',
      }
    }
    
    return {
      canFill: true,
      formConfig,
      fieldMapping,
    }
  }
  
  /**
   * Get a summary of what fields will be filled
   * @param {string} formId - The form identifier
   * @param {object} formData - User form data
   * @returns {object} Summary of fields
   */
  getFilledFieldsSummary(formId, formData) {
    try {
      const pdfFieldData = mapFormDataToPDF(formData, formId)
      const fieldCount = Object.keys(pdfFieldData).length
      const filledFields = Object.entries(pdfFieldData)
        .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      
      return {
        totalFields: fieldCount,
        filledFields: filledFields.length,
        emptyFields: fieldCount - filledFields.length,
        fields: pdfFieldData,
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      return null
    }
  }
}

export default new PDFFillingService()

