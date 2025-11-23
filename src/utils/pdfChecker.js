import pdfService from '../services/pdfService'

/**
 * Check if a PDF from GCS is fillable
 */
export async function checkPDFFillable(pdfUrl) {
  try {
    const result = await pdfService.checkIfFillable(pdfUrl)
    return {
      isFillable: result.isFillable,
      fieldCount: result.fieldCount,
      fields: result.fields,
      error: null,
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
 * Check all form templates from GCS
 */
export async function checkAllTemplates(templates) {
  const results = []
  
  for (const template of templates) {
    if (!template.templateUrl) {
      results.push({
        formId: template.id,
        formName: template.name,
        available: false,
        isFillable: null,
        error: 'Template file not available',
      })
      continue
    }
    
    console.log(`Checking ${template.name}...`)
    
    const fillableStatus = await checkPDFFillable(template.templateUrl)
    
    results.push({
      formId: template.id,
      formName: template.name,
      templateFile: template.templateFile,
      available: true,
      isFillable: fillableStatus.isFillable,
      fieldCount: fillableStatus.fieldCount,
      fields: fillableStatus.fields,
      error: fillableStatus.error,
    })
  }
  
  return results
}

/**
 * Generate a report of fillable status
 */
export function generateFillableReport(results) {
  const report = {
    total: results.length,
    available: results.filter(r => r.available).length,
    fillable: results.filter(r => r.isFillable).length,
    nonFillable: results.filter(r => r.available && !r.isFillable).length,
    unavailable: results.filter(r => !r.available).length,
    details: results,
  }
  
  return report
}

/**
 * Log fillable report to console
 */
export function logFillableReport(report) {
  console.log('\n========================================')
  console.log('PDF FILLABLE STATUS REPORT')
  console.log('========================================\n')
  
  console.log(`Total Forms: ${report.total}`)
  console.log(`Available: ${report.available}`)
  console.log(`Fillable: ${report.fillable} ✅`)
  console.log(`Non-Fillable: ${report.nonFillable} ⚠️`)
  console.log(`Unavailable: ${report.unavailable} ❌`)
  
  console.log('\n========================================')
  console.log('DETAILED RESULTS')
  console.log('========================================\n')
  
  report.details.forEach((result, index) => {
    console.log(`${index + 1}. ${result.formName}`)
    console.log(`   File: ${result.templateFile || 'N/A'}`)
    console.log(`   Available: ${result.available ? 'Yes' : 'No'}`)
    
    if (result.available) {
      if (result.isFillable) {
        console.log(`   Status: ✅ FILLABLE`)
        console.log(`   Fields: ${result.fieldCount}`)
        if (result.fieldCount > 0 && result.fieldCount <= 10) {
          console.log(`   Field Names:`)
          result.fields.slice(0, 10).forEach(field => {
            console.log(`      - ${field.name} (${field.type})`)
          })
        }
      } else {
        console.log(`   Status: ⚠️  NON-FILLABLE`)
        console.log(`   Note: Will need text overlay approach`)
      }
    } else {
      console.log(`   Status: ❌ NOT AVAILABLE`)
      console.log(`   Error: ${result.error}`)
    }
    
    console.log('')
  })
  
  console.log('========================================')
  console.log('RECOMMENDATIONS')
  console.log('========================================\n')
  
  const fillable = report.details.filter(r => r.isFillable)
  const nonFillable = report.details.filter(r => r.available && !r.isFillable)
  
  if (fillable.length > 0) {
    console.log('✅ Fillable Forms (use pdfService.fillPDFForm):')
    fillable.forEach(f => console.log(`   - ${f.formName}`))
    console.log('')
  }
  
  if (nonFillable.length > 0) {
    console.log('⚠️  Non-Fillable Forms (use text overlay approach):')
    nonFillable.forEach(f => console.log(`   - ${f.formName}`))
    console.log('')
  }
  
  console.log('========================================\n')
}

