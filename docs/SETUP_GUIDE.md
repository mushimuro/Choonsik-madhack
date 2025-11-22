# Firebase Setup Guide

This guide will walk you through setting up Firebase for the Wisconsin Tax Form Filler application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "wisconsin-tax-forms")
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the web icon (`</>`)
2. Register your app with a nickname (e.g., "Tax Form Web App")
3. (Optional) Set up Firebase Hosting
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need this later

## Step 3: Enable Authentication

1. In the Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### Optional: Set Up Email Verification

1. Go to "Authentication" > "Templates"
2. Customize the email verification template
3. Update your domain settings

## Step 4: Set Up Firestore Database

1. In the Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (we'll set up rules next)
4. Select a location for your database (choose closest to your users)
5. Click "Enable"

### Configure Firestore Security Rules

Go to the "Rules" tab and replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Tax forms - users can only access their own forms
    match /taxForms/{formId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }
    
    // User documents - users can only access their own documents
    match /userDocuments/{docId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Form templates - everyone can read, only admins can write
    match /formTemplates/{templateId} {
      allow read: if true;
      allow write: if false; // Set up admin role if needed
    }
  }
}
```

### Create Firestore Indexes

For optimal performance, create these indexes:

1. Go to "Indexes" tab
2. Create composite indexes:
   - Collection: `taxForms`
     - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Collection: `userDocuments`
     - Fields: `userId` (Ascending), `createdAt` (Descending)

## Step 5: Set Up Firebase Storage

1. In the Firebase Console, click "Storage" in the left sidebar
2. Click "Get started"
3. Start in production mode
4. Choose a location (same as Firestore)
5. Click "Done"

### Configure Storage Security Rules

Go to the "Rules" tab and replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the file
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Helper function to validate file size (10MB max)
    function isValidSize() {
      return request.resource.size < 10 * 1024 * 1024;
    }
    
    // Helper function to validate file type
    function isValidFileType() {
      return request.resource.contentType.matches('image/.*') ||
             request.resource.contentType == 'application/pdf';
    }
    
    // User's uploaded documents
    match /users/{userId}/documents/{allPaths=**} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isValidSize() && isValidFileType();
      allow delete: if isOwner(userId);
    }
    
    // User's generated forms
    match /users/{userId}/generated-forms/{allPaths=**} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Form templates - read-only for all authenticated users
    match /templates/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if false; // Only admins through Firebase Console
    }
  }
}
```

## Step 6: Configure Your Application

1. Copy `.env.example` to `.env` in your project root
2. Fill in your Firebase configuration from Step 2:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Step 7: Seed Form Templates (Optional)

To populate the form templates collection:

1. Go to Firestore Database in Firebase Console
2. Click "Start collection"
3. Collection ID: `formTemplates`
4. Add documents with the following structure:

```json
{
  "id": "wi_form_1",
  "name": "Wisconsin Form 1",
  "fullName": "Wisconsin Individual Income Tax Return",
  "type": "wisconsin",
  "year": 2024,
  "description": "Wisconsin state income tax return",
  "isActive": true,
  "templateUrl": "URL_TO_YOUR_PDF_TEMPLATE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Step 8: Upload PDF Templates to Storage

1. Go to Storage in Firebase Console
2. Create a folder called `templates`
3. Upload your PDF form templates
4. Copy the download URLs
5. Update the `templateUrl` fields in your form templates collection

## Step 9: Test Your Configuration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to:
   - Register a new account
   - Login
   - Create a form
   - Upload a document
   - Check Firestore and Storage to verify data is being saved

## Troubleshooting

### Authentication Issues

- Verify that Email/Password is enabled in Authentication settings
- Check that your domain is authorized in Authentication > Settings > Authorized domains

### Firestore Permission Denied

- Make sure your security rules are correctly set up
- Verify that the user is authenticated
- Check that the `userId` field matches the authenticated user's UID

### Storage Upload Fails

- Verify Storage security rules are correct
- Check file size (should be under 10MB)
- Verify file type (PDF or images only)
- Ensure user is authenticated

### CORS Errors

- Add your development and production domains to Firebase authorized domains
- Check Storage CORS configuration

## Production Checklist

Before deploying to production:

- [ ] Review and tighten Firestore security rules
- [ ] Review and tighten Storage security rules
- [ ] Set up proper indexing for Firestore queries
- [ ] Enable Firebase App Check for additional security
- [ ] Set up monitoring and alerts
- [ ] Configure budget alerts in Google Cloud Console
- [ ] Test all features thoroughly
- [ ] Set up automated backups for Firestore
- [ ] Review Firebase pricing and set up billing alerts

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security/start)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

