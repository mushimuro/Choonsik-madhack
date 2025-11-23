import pdfService from '../services/pdfService'

/**
 * PDF Field Inspector
 * Utility to inspect and list all fields in a fillable PDF
 * Use this to discover the actual field names in your tax form PDFs
 */

/**
 * Inspect a PDF and return all field information
 */
export async function inspectPDFFields(pdfUrl) {
  try {
    const fields = await pdfService.getFormFields(pdfUrl)
    
    console.group(`📄 PDF Fields for: ${pdfUrl}`)
    console.log(`Total fields: ${fields.length}`)
    console.table(fields)
    console.groupEnd()
    
    return fields
  } catch (error) {
    console.error('Error inspecting PDF fields:', error)
    throw error
  }
}

/**
 * Compare required form fields with actual PDF fields
 */
export function compareFields(requiredFields, pdfFields) {
  const pdfFieldNames = pdfFields.map(f => f.name)
  
  const matched = []
  const missing = []
  
  requiredFields.forEach(field => {
    if (pdfFieldNames.includes(field.pdfFieldName)) {
      matched.push(field)
    } else {
      missing.push(field)
    }
  })
  
  const unmapped = pdfFields.filter(
    pdfField => !requiredFields.find(f => f.pdfFieldName === pdfField.name)
  )
  
  console.group('🔍 Field Mapping Analysis')
  console.log('✅ Matched fields:', matched.length)
  console.log('❌ Missing fields:', missing.length)
  console.log('⚠️  Unmapped PDF fields:', unmapped.length)
  
  if (missing.length > 0) {
    console.log('\nMissing field mappings:')
    console.table(missing)
  }
  
  if (unmapped.length > 0) {
    console.log('\nUnmapped PDF fields:')
    console.table(unmapped)
  }
  console.groupEnd()
  
  return { matched, missing, unmapped }
}

/**
 * Generate field mapping template from PDF fields
 */
export function generateMappingTemplate(pdfFields, formType) {
  const template = {
    formType,
    generatedAt: new Date().toISOString(),
    fields: pdfFields.map(field => ({
      pdfFieldName: field.name,
      pdfFieldType: field.type,
      appFieldName: '', // To be filled manually
      transformer: null, // Optional: function to transform value
      description: '', // To be filled manually
    })),
  }
  
  console.log(`Generated mapping template for ${formType}:`)
  console.log(JSON.stringify(template, null, 2))
  
  return template
}

export default {
  inspectPDFFields,
  compareFields,
  generateMappingTemplate,
}

