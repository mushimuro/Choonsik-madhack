import { useState, useRef } from 'react'
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi'
import { formatFileSize } from '../../utils/helpers'
import Button from '../Common/Button'
import './FileUpload.css'

const FileUpload = ({
  onUpload,
  onRemove,
  uploadedFiles = [],
  acceptedTypes = 'application/pdf,image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file size
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`)
          continue
        }

        // Call upload handler
        await onUpload(file, (progress) => {
          setUploadProgress(progress)
        })

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="file-upload">
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <FiUpload className="upload-icon" />
        <p className="upload-text">
          Drag and drop files here, or{' '}
          <button className="upload-link" onClick={handleButtonClick}>
            browse
          </button>
        </p>
        <p className="upload-hint">
          Supported formats: PDF, JPG, PNG (Max {formatFileSize(maxSize)})
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="progress-text">{Math.round(uploadProgress)}%</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4 className="uploaded-title">Uploaded Files</h4>
          <div className="files-list">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <FiFile className="file-icon" />
                  <div className="file-details">
                    <p className="file-name">{file.name || file.originalName}</p>
                    <p className="file-size">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="file-actions">
                  <FiCheck className="file-check" />
                  <button
                    className="file-remove"
                    onClick={() => onRemove(file)}
                    aria-label="Remove file"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload

