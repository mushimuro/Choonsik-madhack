# PDF Implementation Guide

This guide will help you implement PDF form filling based on whether your tax form PDFs are fillable or non-fillable.

## Step 1: Determine Your PDF Type

First, you need to check if your Wisconsin tax form PDFs are fillable forms or static PDFs.

### Check if PDF is Fillable

Use the built-in PDF service method:

```javascript
import pdfService from './services/pdfService'

// Check if PDF has fillable fields
const pdfUrl = 'path/to/wisconsin-form-1.pdf'
const result = await pdfService.checkIfFillable(pdfUrl)

console.log('Is fillable:', result.isFillable)
console.log('Field count:', result.fieldCount)
console.log('Fields:', result.fields)
```

This will tell you:
- Whether the PDF has fillable form fields
- How many fields it has
- The names and types of each field

## Approach A: Fillable PDF Forms

If your PDF has fillable form fields, use this approach.

### Step 1: Get Field Names

```javascript
import pdfService from './services/pdfService'

const fields = await pdfService.getFormFields('path/to/form.pdf')
console.log(fields)
// Output: [
//   { name: 'firstName', type: 'PDFTextField', value: '' },
//   { name: 'lastName', type: 'PDFTextField', value: '' },
//   { name: 'ssn', type: 'PDFTextField', value: '' },
//   ...
// ]
```

### Step 2: Create Field Mapping

Create a mapping between your form data and PDF field names in `src/constants/pdfFieldMappings.js`:

```javascript
export const WI_FORM_1_FIELD_MAPPING = {
  // Your form data key: PDF field name
  'firstName': 'topmostSubform[0].Page1[0].f1_01[0]',
  'lastName': 'topmostSubform[0].Page1[0].f1_02[0]',
  'ssn': 'topmostSubform[0].Page1[0].f1_03[0]',
  'address': 'topmostSubform[0].Page1[0].f1_04[0]',
  // Add all your field mappings here
}
```

### Step 3: Implement PDF Filling

Update `src/services/pdfService.js` to add a specific method for your form:

```javascript
/**
 * Fill Wisconsin Form 1
 */
async fillWisconsinForm1(templateUrl, formData) {
  try {
    const pdfDoc = await this.loadPDF(templateUrl)
    const form = pdfDoc.getForm()

    // Map your form data to PDF fields
    Object.keys(WI_FORM_1_FIELD_MAPPING).forEach(key => {
      const pdfFieldName = WI_FORM_1_FIELD_MAPPING[key]
      const value = formData[key]

      if (value && pdfFieldName) {
        try {
          const field = form.getField(pdfFieldName)
          const fieldType = field.constructor.name

          switch (fieldType) {
            case 'PDFTextField':
              field.setText(String(value))
              break
            case 'PDFCheckBox':
              if (value) field.check()
              break
            case 'PDFRadioGroup':
              field.select(value)
              break
          }
        } catch (err) {
          console.warn(`Could not fill field ${pdfFieldName}:`, err.message)
        }
      }
    })

    // Optional: Flatten the form to make it read-only
    // form.flatten()

    return pdfDoc
  } catch (error) {
    throw new Error(`Error filling Wisconsin Form 1: ${error.message}`)
  }
}
```

### Step 4: Use in ReviewPage

Update `src/pages/ReviewPage.jsx`:

```javascript
const handleGeneratePDF = async () => {
  try {
    setGenerating(true)
    
    // Get the template URL from Firebase Storage or your constants
    const templateUrl = currentForm.templateUrl
    
    // Fill the PDF with user data
    const filledPDF = await pdfService.fillWisconsinForm1(templateUrl, formData)
    
    // Save to Firebase Storage
    const blob = await pdfService.savePDFAsBlob(filledPDF)
    const result = await storageService.uploadGeneratedForm(
      currentUser.uid,
      blob,
      currentForm.name
    )
    
    // Download the PDF
    await pdfService.downloadPDF(filledPDF, `${currentForm.name}.pdf`)
    
    toast.success('PDF generated successfully!')
  } catch (error) {
    toast.error('Error generating PDF: ' + error.message)
  } finally {
    setGenerating(false)
  }
}
```

## Approach B: Non-Fillable PDF Forms

If your PDF doesn't have fillable fields, you'll need to overlay text at specific coordinates.

### Step 1: Determine Field Coordinates

You'll need to find the exact coordinates (x, y) for each field on the PDF. Use a PDF editor or this helper function:

```javascript
// Helper to print page dimensions
async function getPDFPageInfo(pdfUrl) {
  const pdfDoc = await pdfService.loadPDF(pdfUrl)
  const pages = pdfDoc.getPages()
  
  pages.forEach((page, index) => {
    const { width, height } = page.getSize()
    console.log(`Page ${index + 1}: ${width} x ${height}`)
  })
}
```

### Step 2: Create Coordinate Mapping

Create a file `src/constants/pdfCoordinates.js`:

```javascript
export const WI_FORM_1_COORDINATES = {
  page1: {
    firstName: { x: 100, y: 700, size: 12 },
    lastName: { x: 300, y: 700, size: 12 },
    ssn: { x: 100, y: 680, size: 12 },
    address: { x: 100, y: 660, size: 12 },
    city: { x: 100, y: 640, size: 12 },
    state: { x: 300, y: 640, size: 12 },
    zipCode: { x: 350, y: 640, size: 12 },
    // Add coordinates for all fields
  },
  page2: {
    // Coordinates for page 2 fields
  }
}
```

### Step 3: Implement Text Overlay

Add this method to `src/services/pdfService.js`:

```javascript
/**
 * Fill non-fillable Wisconsin Form 1 using text overlay
 */
async fillWisconsinForm1WithOverlay(templateUrl, formData) {
  try {
    const pdfDoc = await this.loadPDF(templateUrl)
    const pages = pdfDoc.getPages()
    
    // Page 1
    const page1 = pages[0]
    const coordinates = WI_FORM_1_COORDINATES.page1
    
    Object.keys(coordinates).forEach(key => {
      const value = formData[key]
      if (value) {
        const { x, y, size } = coordinates[key]
        page1.drawText(String(value), {
          x,
          y,
          size,
          color: rgb(0, 0, 0),
        })
      }
    })
    
    // Repeat for other pages as needed
    
    return pdfDoc
  } catch (error) {
    throw new Error(`Error filling form with overlay: ${error.message}`)
  }
}
```

### Step 4: Handle Different Fonts (Optional)

If you need custom fonts:

```javascript
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

async fillWithCustomFont(templateUrl, formData) {
  const pdfDoc = await this.loadPDF(templateUrl)
  pdfDoc.registerFontkit(fontkit)
  
  // Load custom font
  const fontBytes = await fetch('/fonts/CustomFont.ttf').then(res => res.arrayBuffer())
  const customFont = await pdfDoc.embedFont(fontBytes)
  
  const page = pdfDoc.getPage(0)
  page.drawText('Text with custom font', {
    x: 100,
    y: 700,
    size: 12,
    font: customFont,
    color: rgb(0, 0, 0),
  })
  
  return pdfDoc
}
```

## Approach C: Hybrid Approach

Some PDFs may have some fillable fields and require overlay for others.

```javascript
async fillWisconsinForm1Hybrid(templateUrl, formData) {
  try {
    const pdfDoc = await this.loadPDF(templateUrl)
    const form = pdfDoc.getForm()
    const page = pdfDoc.getPage(0)
    
    // Fill fillable fields
    try {
      const firstNameField = form.getField('firstName')
      firstNameField.setText(formData.firstName)
    } catch (e) {
      // Field doesn't exist, use overlay
      page.drawText(formData.firstName, {
        x: 100,
        y: 700,
        size: 12,
      })
    }
    
    // Repeat for other fields
    
    return pdfDoc
  } catch (error) {
    throw new Error(`Error filling hybrid form: ${error.message}`)
  }
}
```

## Testing Your Implementation

### Test Script

Create `scripts/testPDF.js`:

```javascript
import pdfService from '../src/services/pdfService'

const testData = {
  firstName: 'John',
  lastName: 'Doe',
  ssn: '123-45-6789',
  // ... other test data
}

async function test() {
  try {
    console.log('Testing PDF fillability...')
    const result = await pdfService.checkIfFillable('path/to/form.pdf')
    console.log('Result:', result)
    
    if (result.isFillable) {
      console.log('Testing fillable approach...')
      const filled = await pdfService.fillWisconsinForm1('path/to/form.pdf', testData)
      await pdfService.downloadPDF(filled, 'test-output.pdf')
    } else {
      console.log('Testing overlay approach...')
      const filled = await pdfService.fillWisconsinForm1WithOverlay('path/to/form.pdf', testData)
      await pdfService.downloadPDF(filled, 'test-output.pdf')
    }
    
    console.log('Success! Check test-output.pdf')
  } catch (error) {
    console.error('Error:', error)
  }
}

test()
```

## Best Practices

1. **Always test with sample data first**
2. **Handle errors gracefully** - some fields might not exist
3. **Validate data before filling** - ensure correct format
4. **Consider page sizes** - coordinates vary by PDF dimensions
5. **Flatten forms when appropriate** - makes PDFs read-only
6. **Keep field mappings updated** - when forms change
7. **Test across different PDF viewers** - Adobe, Chrome, Firefox, etc.

## Common Issues

### Issue: Fields not filling correctly

**Solution**: Check field names match exactly (case-sensitive)

```javascript
// Get all field names
const form = pdfDoc.getForm()
const fields = form.getFields()
fields.forEach(field => {
  console.log(`Field name: "${field.getName()}"`)
})
```

### Issue: Text appears in wrong position

**Solution**: PDF coordinates start from bottom-left. Calculate properly:

```javascript
// If you have coordinates from top-left
const pageHeight = page.getHeight()
const yFromBottom = pageHeight - yFromTop
```

### Issue: Special characters not displaying

**Solution**: Embed custom fonts or use StandardFonts

```javascript
const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
page.drawText(text, { font: helveticaFont })
```

## Resources

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [PDF-lib Examples](https://github.com/Hopding/pdf-lib#usage-examples)
- [Wisconsin DOR Forms](https://www.revenue.wi.gov/Pages/Form/home.aspx)
- [IRS PDF Forms](https://www.irs.gov/forms-instructions)

## Next Steps

1. Obtain official PDF templates from Wisconsin DOR website
2. Determine if they're fillable or require overlay
3. Implement the appropriate approach
4. Test thoroughly with various data inputs
5. Add error handling and user feedback
6. Consider adding a preview feature before download

