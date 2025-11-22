import { TAX_FORMS } from '../constants/taxForms'

/**
 * Map GCS template files to form definitions
 */
export function mapGCSFilesToForms(gcsFiles) {
  return Object.values(TAX_FORMS).map(form => {
    const gcsFile = gcsFiles.find(f => f.fileName === form.templateFile)
    
    return {
      ...form,
      templateUrl: gcsFile?.url || null,
      templatePath: gcsFile?.path || null,
      available: !!gcsFile,
      fileSize: gcsFile?.size || 0,
    }
  })
}

/**
 * Get template URL for a specific form
 */
export async function getTemplateUrl(gcsService, formId) {
  const form = Object.values(TAX_FORMS).find(f => f.id === formId)
  
  if (!form || !form.templateFile) {
    throw new Error(`Form ${formId} not found or has no template file`)
  }
  
  try {
    const template = await gcsService.getFormTemplate(form.templateFile)
    return template.url
  } catch (error) {
    throw new Error(`Failed to get template for ${formId}: ${error.message}`)
  }
}

