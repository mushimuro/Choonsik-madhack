# Wisconsin Tax Form Filler

A modern web application for filling out Wisconsin and federal tax forms with ease. Built with React, Firebase, and pdf-lib.

## Features

- 🔐 **Secure Authentication** - Firebase-based user authentication
- 📝 **Smart Form Filling** - Guided form completion with validation
- 📤 **Document Upload** - Upload and store supporting tax documents
- 📄 **PDF Generation** - Generate completed tax forms as downloadable PDFs
- 💾 **Auto-Save** - Never lose your progress with automatic draft saving
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔒 **Data Security** - All data encrypted and stored securely in Firebase

## Supported Forms

### Wisconsin State Forms
- **Form 1** - Individual Income Tax Return
- **Form 1NPR** - Nonresident/Part-Year Resident Income Tax Return
- **Schedule I** - Itemized Deductions

### Federal Forms
- **Form 1040** - U.S. Individual Income Tax Return
- **Schedule C** - Profit or Loss from Business

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Firebase Authentication, Firebase Storage (GCP Buckets)
- **Storage Architecture**: 
  - `form-templates/` - Tax form PDF templates
  - `user-tax-forms/` - User's completed forms and documents
- **PDF Processing**: pdf-lib, react-pdf
- **Form Management**: Formik, Yup
- **Styling**: Custom CSS with CSS Variables
- **Icons**: React Icons
- **Routing**: React Router v6
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Firebase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wisconsin-tax-form-filler.git
   cd wisconsin-tax-form-filler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Set up Firebase Storage (see `docs/GCP_STORAGE_SETUP.md`)
   - Copy your Firebase configuration

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Common/         # Common UI components (Button, Input, etc.)
│   ├── Forms/          # Tax form components
│   ├── Layout/         # Layout components (Header, Footer)
│   ├── PDF/            # PDF viewer and related components
│   └── Upload/         # File upload components
├── config/             # Configuration files
│   └── firebase.js     # Firebase configuration
├── constants/          # Application constants
│   ├── formFields.js   # Form field definitions
│   └── taxForms.js     # Tax form metadata
├── contexts/           # React Context providers
│   ├── AuthContext.jsx # Authentication context
│   └── TaxFormContext.jsx # Tax form state management
├── hooks/              # Custom React hooks
│   ├── useForm.js      # Form handling hook
│   ├── useFileUpload.js # File upload hook
│   └── useLocalStorage.js # Local storage hook
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── TaxFormSelectionPage.jsx
│   ├── TaxFormInputPage.jsx
│   ├── DocumentUploadPage.jsx
│   ├── ReviewPage.jsx
│   ├── HistoryPage.jsx
│   ├── ProfilePage.jsx
│   └── NotFoundPage.jsx
├── services/           # API and service layers
│   ├── authService.js  # Authentication service
│   ├── gcpStorageService.js # GCP Storage service (main storage)
│   ├── storageService.js # Legacy Firebase Storage service
│   ├── firestoreService.js # Legacy Firestore service (optional)
│   └── pdfService.js   # PDF manipulation service
├── utils/              # Utility functions
│   ├── helpers.js      # General helper functions
│   └── validators.js   # Form validation utilities
├── App.jsx             # Main App component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## Building for Production

```bash
npm run build
```

The build files will be in the `dist/` directory.

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase:
   ```bash
   firebase init
   ```

4. Deploy:
   ```bash
   npm run build
   firebase deploy
   ```

### Other Platforms

The built files in `dist/` can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3
- Google Cloud Storage

## PDF Implementation

The application is designed to support both:

1. **Fillable PDF Forms** - PDFs with form fields that can be programmatically filled
2. **Non-fillable PDFs** - PDFs where text overlays are added at specific coordinates

See [PDF_IMPLEMENTATION_GUIDE.md](./docs/PDF_IMPLEMENTATION_GUIDE.md) for detailed instructions on implementing PDF form filling based on your form type.

## Firebase & Storage Setup

- **Authentication Setup**: See [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)
- **GCP Storage Setup**: See [GCP_STORAGE_SETUP.md](./docs/GCP_STORAGE_SETUP.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for educational purposes. Always consult with a tax professional for official tax filing. The developers are not responsible for any errors in tax calculations or submissions.

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

- [ ] Support for more tax forms
- [ ] E-filing integration
- [ ] Tax calculation engine
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Tax professional collaboration features
