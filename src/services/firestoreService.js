import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Firestore Service
 * Handles all Firebase Firestore database operations
 */
class FirestoreService {
  /**
   * Create a new document in a collection
   */
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`)
    }
  }

  /**
   * Get a document by ID
   */
  async getById(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        return null
      }
    } catch (error) {
      throw new Error(`Error getting document: ${error.message}`)
    }
  }

  /**
   * Get all documents from a collection
   */
  async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      throw new Error(`Error getting documents: ${error.message}`)
    }
  }

  /**
   * Query documents with filters
   */
  async query(collectionName, filters = [], orderByField = null, limitCount = null) {
    try {
      let q = collection(db, collectionName)
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value))
      })
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'))
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount))
      }
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      throw new Error(`Error querying documents: ${error.message}`)
    }
  }

  /**
   * Update a document
   */
  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`)
    }
  }

  /**
   * Delete a document
   */
  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`)
    }
  }

  /**
   * Get user's tax forms
   */
  async getUserTaxForms(userId) {
    return this.query(
      'taxForms',
      [{ field: 'userId', operator: '==', value: userId }],
      { field: 'createdAt', direction: 'desc' }
    )
  }

  /**
   * Create a new tax form submission
   */
  async createTaxForm(userId, formData) {
    return this.create('taxForms', {
      userId,
      ...formData,
      status: 'draft',
    })
  }

  /**
   * Update tax form data
   */
  async updateTaxForm(formId, formData) {
    return this.update('taxForms', formId, formData)
  }

  /**
   * Get tax form by ID
   */
  async getTaxForm(formId) {
    return this.getById('taxForms', formId)
  }

  /**
   * Save user document to database
   */
  async saveUserDocument(userId, documentData) {
    return this.create('userDocuments', {
      userId,
      ...documentData,
    })
  }

  /**
   * Get user's documents
   */
  async getUserDocuments(userId) {
    return this.query(
      'userDocuments',
      [{ field: 'userId', operator: '==', value: userId }],
      { field: 'createdAt', direction: 'desc' }
    )
  }

  /**
   * Save form template metadata
   */
  async saveFormTemplate(templateData) {
    return this.create('formTemplates', templateData)
  }

  /**
   * Get all form templates
   */
  async getFormTemplates() {
    return this.query(
      'formTemplates',
      [{ field: 'isActive', operator: '==', value: true }],
      { field: 'name', direction: 'asc' }
    )
  }
}

export default new FirestoreService()

