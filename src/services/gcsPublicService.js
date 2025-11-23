/**
 * GCS Public Access Service
 * Alternative approach using public bucket access
 * (for testing if auth issues exist)
 */

import { GCS_CONFIG } from '../config/gcs'

class GCSPublicService {
  constructor() {
    this.bucketName = GCS_CONFIG.bucketName
    this.baseUrl = `https://storage.googleapis.com/${this.bucketName}`
  }

  /**
   * List files using public XML API (if bucket is public)
   */
  async listFilesPublic(prefix = '') {
    try {
      // Use the XML API to list files (works if bucket is public)
      const url = `https://storage.googleapis.com/${this.bucketName}?prefix=${prefix}`
      console.log('🔗 Public XML API URL:', url)
      
      const response = await fetch(url)
      console.log('📡 Response Status:', response.status)
      
      if (!response.ok) {
        const text = await response.text()
        console.error('❌ Error Response:', text)
        throw new Error(`Failed to list files: ${response.status}`)
      }

      const text = await response.text()
      console.log('📦 XML Response length:', text.length)
      
      // Parse XML response
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')
      
      const contents = xmlDoc.getElementsByTagName('Contents')
      const files = []
      
      for (let i = 0; i < contents.length; i++) {
        const content = contents[i]
        const key = content.getElementsByTagName('Key')[0]?.textContent
        const size = content.getElementsByTagName('Size')[0]?.textContent
        
        if (key && key.toLowerCase().endsWith('.pdf')) {
          files.push({
            name: key,
            path: key,
            url: `${this.baseUrl}/${key}`,
            size: parseInt(size) || 0,
            contentType: 'application/pdf',
          })
        }
      }
      
      console.log('✅ Found files:', files.length)
      return files
    } catch (error) {
      console.error('❌ Error listing public files:', error)
      throw error
    }
  }

  /**
   * Get direct public URL for a file
   */
  getPublicUrl(path) {
    return `${this.baseUrl}/${path}`
  }

  /**
   * Test if a file is publicly accessible
   */
  async testFileAccess(path) {
    try {
      const url = this.getPublicUrl(path)
      const response = await fetch(url, { method: 'HEAD' })
      return {
        accessible: response.ok,
        status: response.status,
        url,
      }
    } catch (error) {
      return {
        accessible: false,
        error: error.message,
        url: this.getPublicUrl(path),
      }
    }
  }

  /**
   * List form templates using public access
   */
  async listFormTemplates() {
    try {
      const files = await this.listFilesPublic('form-templates/')
      
      return files.map(file => ({
        fileName: file.name.split('/').pop(),
        path: file.path,
        url: file.url,
        size: file.size,
        contentType: file.contentType,
      }))
    } catch (error) {
      console.error('❌ Error listing templates:', error)
      throw error
    }
  }
}

export default new GCSPublicService()

