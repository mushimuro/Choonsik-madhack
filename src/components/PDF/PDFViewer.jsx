import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi'
import Button from '../Common/Button'
import './PDFViewer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFViewer = ({ file, fileName = 'document.pdf' }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setLoading(false)
  }

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error)
    setLoading(false)
  }

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset)
  }

  const previousPage = () => {
    changePage(-1)
  }

  const nextPage = () => {
    changePage(1)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = file
    link.download = fileName
    link.click()
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <div className="pdf-navigation">
          <Button
            variant="outline"
            size="small"
            onClick={previousPage}
            disabled={pageNumber <= 1}
            icon={<FiChevronLeft />}
          >
            Previous
          </Button>
          <span className="page-info">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <Button
            variant="outline"
            size="small"
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            icon={<FiChevronRight />}
          >
            Next
          </Button>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={handleDownload}
          icon={<FiDownload />}
        >
          Download
        </Button>
      </div>

      <div className="pdf-document-container">
        {loading && (
          <div className="pdf-loading">
            <div className="spinner"></div>
            <p>Loading PDF...</p>
          </div>
        )}
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="pdf-loading">Loading...</div>}
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="pdf-page"
          />
        </Document>
      </div>
    </div>
  )
}

export default PDFViewer

