const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {Storage} = require('@google-cloud/storage');
const cors = require('cors')({origin: true});

admin.initializeApp();
const storage = new Storage();
const bucket = storage.bucket('choonsik-madhack');

/**
 * Cloud Function to upload generated PDF to GCS
 * POST /uploadPDF
 * Body: { userId, formId, pdfBase64, filename }
 */
exports.uploadPDF = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Only allow POST
      if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
      }

      // Get Firebase Auth token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Unauthorized'});
      }

      const idToken = authHeader.split('Bearer ')[1];
      
      // Verify token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Get request body
      const {userId, formId, pdfBase64, filename} = req.body;

      // Verify user owns this data
      if (uid !== userId) {
        return res.status(403).json({error: 'Forbidden'});
      }

      // Validate inputs
      if (!userId || !formId || !pdfBase64 || !filename) {
        return res.status(400).json({error: 'Missing required fields'});
      }

      // Convert base64 to buffer
      const fileBuffer = Buffer.from(pdfBase64, 'base64');

      // Create file path following GCS structure
      const timestamp = Date.now();
      const filePath = `user-tax-forms/${userId}/${formId}/${filename}`;

      // Determine content type from filename
      const contentType = filename.endsWith('.json') ? 'application/json' : 'application/pdf';

      // Upload to GCS
      const file = bucket.file(filePath);
      await file.save(fileBuffer, {
        metadata: {
          contentType: contentType,
          metadata: {
            userId,
            formId,
            uploadedAt: new Date().toISOString(),
            timestamp: timestamp.toString(),
          },
        },
      });

      console.log(`File uploaded: ${filePath}`);

      // Return success
      return res.status(200).json({
        success: true,
        filePath,
        url: `https://storage.googleapis.com/choonsik-madhack/${filePath}`,
        message: 'File uploaded successfully',
      });

    } catch (error) {
      console.error('Error uploading PDF:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  });
});

/**
 * Cloud Function to save form data JSON to GCS
 * POST /saveFormData
 */
exports.saveFormData = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Unauthorized'});
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const {userId, formId, formData} = req.body;

      if (uid !== userId) {
        return res.status(403).json({error: 'Forbidden'});
      }

      if (!userId || !formId || !formData) {
        return res.status(400).json({error: 'Missing required fields'});
      }

      // Create file path
      const timestamp = Date.now();
      const filePath = `user-tax-forms/${userId}/${formId}/form-data-${timestamp}.json`;

      // Upload JSON to GCS
      const file = bucket.file(filePath);
      await file.save(JSON.stringify(formData, null, 2), {
        metadata: {
          contentType: 'application/json',
          metadata: {
            userId,
            formId,
            savedAt: new Date().toISOString(),
          },
        },
      });

      console.log(`Form data saved: ${filePath}`);

      return res.status(200).json({
        success: true,
        filePath,
        message: 'Form data saved successfully',
      });

    } catch (error) {
      console.error('Error saving form data:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  });
});

/**
 * Cloud Function to delete a file from GCS
 * POST /deleteFile
 * Body: { userId, filePath }
 */
exports.deleteFile = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Unauthorized'});
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const {userId, filePath} = req.body;

      if (uid !== userId) {
        return res.status(403).json({error: 'Forbidden'});
      }

      if (!userId || !filePath) {
        return res.status(400).json({error: 'Missing required fields'});
      }

      // Verify the file path belongs to the user
      if (!filePath.startsWith(`user-tax-forms/${userId}/`)) {
        return res.status(403).json({error: 'Cannot delete files outside your directory'});
      }

      // Delete the file from GCS
      const file = bucket.file(filePath);

      // Check if file exists first
      const [exists] = await file.exists();
      if (!exists) {
        console.log(`File not found, considering it already deleted: ${filePath}`);
        return res.status(200).json({
          success: true,
          message: 'File not found (may have been already deleted)',
        });
      }
      
      await file.delete();

      console.log(`File deleted successfully: ${filePath}`);

      return res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });

    } catch (error) {
      console.error('Error deleting file:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        code: error.code,
      });
    }
  });
});
