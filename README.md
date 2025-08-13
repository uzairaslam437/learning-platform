# Learning Platform Frontend

A modern, responsive learning management system built with React, TypeScript, and Vite. This platform allows students to browse and purchase courses, and instructors to create and manage their courses.

## 🚀 Features

- **User Authentication**: Student and instructor registration/login
- **Course Management**: Browse, purchase, and access courses
- **File Viewer**: View PDFs, images, videos, and documents
- **Payment Integration**: Stripe payment processing
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Linting**: ESLint with TypeScript support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Payment Configuration (if using Stripe)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Other Configuration
VITE_APP_NAME=Learning Platform
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── AuthPage.tsx    # Authentication pages
│   ├── CourseDetail.tsx # Course detail view
│   ├── CreateCourse.tsx # Course creation form
│   ├── FileViewer.tsx  # File viewing component
│   ├── InstructorDashboard.tsx # Instructor dashboard
│   ├── LandingPage.tsx # Landing page
│   ├── StudentDashboard.tsx # Student dashboard
│   └── UnauthorizedPage.tsx # Access denied page
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/             # Custom React hooks
│   └── Auth.ts        # Authentication hook
├── services/          # API services
│   ├── api.ts         # Base API configuration
│   ├── courseAPI.ts   # Course-related API calls
│   └── payment.ts     # Payment API integration
├── types/             # TypeScript type definitions
│   ├── Auth.ts        # Authentication types
│   ├── course.ts      # Course-related types
│   └── payment.ts     # Payment types
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## 🔧 Configuration

### Vite Configuration

The project uses Vite for fast development and building. Configuration is in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### TypeScript Configuration

TypeScript configuration is split between:
- `tsconfig.json` - Base configuration
- `tsconfig.app.json` - Application-specific configuration
- `tsconfig.node.json` - Node.js/build tool configuration

### ESLint Configuration

ESLint is configured in `eslint.config.js` with TypeScript and React support.

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Check TypeScript types
```

## 🌐 API Integration

### Backend Requirements

The frontend expects a backend API with the following endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Courses**: `/api/courses`, `/api/courses/:id`
- **User Courses**: `/api/user/courses`
- **Payments**: `/api/payments/create-checkout-session`

### API Base URL

Configure the API base URL in your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 💳 Payment Integration

### Stripe Setup

1. Create a Stripe account and get your API keys
2. Add your publishable key to `.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

3. Configure webhook endpoints in your Stripe dashboard
4. Update success/cancel URLs in your payment configuration

## 📁 File Management

### Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM, OGV
- **Documents**: PDF, Word, Excel, PowerPoint
- **Other**: Text files, archives

### File Viewer Features

- Automatic file type detection
- Blob-based loading for CORS issues
- Fallback options for unsupported files
- Retry mechanisms for failed loads

## 🔐 Authentication

### User Roles

- **Student**: Can browse and purchase courses
- **Instructor**: Can create and manage courses

### Authentication Flow

1. User registers/logs in
2. JWT token is stored in localStorage
3. Token is automatically refreshed every 14 minutes
4. Protected routes check authentication status

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling. Custom components are styled using Tailwind utility classes.

### Custom CSS

Custom styles are in:
- `src/index.css` - Global styles
- `src/components/FileViewer.css` - File viewer specific styles

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### Deployment Options

- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Upload the `dist` folder to an S3 bucket
- **Traditional Hosting**: Upload files to your web server

### Environment Variables for Production

Ensure all required environment variables are set in your production environment:

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 5173
   npx kill-port 5173
   ```

2. **TypeScript Errors**
   ```bash
   npm run type-check
   ```

3. **ESLint Issues**
   ```bash
   npm run lint:fix
   ```

4. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Development Tips

- Use the browser's developer tools to debug issues
- Check the console for error messages
- Verify environment variables are loaded correctly
- Ensure the backend API is running and accessible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Contact the development team

## 🔄 Updates

Keep your project up to date:

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update to latest versions (use with caution)
npx npm-check-updates -u
npm install
```

---




# Backend API

A Node.js/Express.js backend API for an online course platform with user authentication, course management, and payment processing capabilities.

## Features

- **User Authentication**: JWT-based authentication with role-based access control (instructor/student)
- **Course Management**: CRUD operations for courses with file upload support
- **Payment Processing**: Stripe integration for course purchases
- **File Storage**: AWS S3 integration for course materials
- **Database**: PostgreSQL with automatic table creation
- **Security**: Password hashing, CORS configuration, and input validation

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory with the following variables:
   
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_s3_bucket_name
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Agora Configuration (for video calls)
   AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_app_certificate
   ```

4. **Database Setup**
   
   - Create a PostgreSQL database
   - Update the `DATABASE_URL` in your `.env` file
   - The application will automatically create required tables on startup

5. **Start the application**
   
   **Development mode (with auto-reload):**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── auth.js         # Authentication logic
│   ├── course.js       # Course management
│   └── payment.js      # Payment processing
├── middlewares/         # Custom middleware
│   └── verifyToken.js  # JWT verification
├── model/              # Database models
│   └── db.js          # Database connection and initialization
├── routes/             # API route definitions
│   ├── auth.js        # Authentication routes
│   ├── course.js      # Course routes
│   └── payment.js     # Payment routes
├── index.js            # Main application file
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh access token

### Courses (`/api/courses`)
- `GET /` - Get all courses
- `POST /` - Create a new course (instructor only)
- `GET /:id` - Get course by ID
- `PUT /:id` - Update course (instructor only)
- `DELETE /:id` - Delete course (instructor only)
- `POST /:id/materials` - Upload course materials

### Payments (`/api/payments`)
- `POST /create-checkout-session` - Create Stripe checkout session
- `POST /stripe-webhook` - Stripe webhook handler

## Database Schema

The application automatically creates the following tables:

- **users**: User accounts with role-based access
- **courses**: Course information and metadata
- **course_materials**: File attachments for courses
- **enrollments**: Student course enrollments
- **payments**: Payment transaction records

## Dependencies

### Core Dependencies
- `express` - Web framework
- `pg` - PostgreSQL client
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### Additional Dependencies
- `stripe` - Payment processing
- `aws-sdk` - AWS services integration
- `multer` - File upload handling
- `agora-access-token` - Video call authentication
- `validator` - Input validation
- `uuid` - Unique identifier generation

## Development

### Scripts
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (not configured yet)

### Environment Variables
Make sure to set all required environment variables in your `.env` file. The application will not start without the essential ones like `DATABASE_URL` and `JWT_SECRET`.

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is configured to allow only specified origins
- Input validation is implemented using the validator library
- Database queries use parameterized statements to prevent SQL injection

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure all environment variables are properly configured
3. Use a process manager like PM2 or Docker
4. Set up a reverse proxy (nginx) if needed
5. Configure SSL/TLS certificates for HTTPS

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` format
   - Ensure database exists and user has proper permissions

2. **JWT Errors**
   - Verify `JWT_SECRET` is set
   - Check token expiration times

3. **CORS Issues**
   - Verify `FRONTEND_URL` is correctly set
   - Check browser console for CORS errors

4. **File Upload Issues**
   - Verify AWS S3 credentials
   - Check S3 bucket permissions
   - Ensure proper file size limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository or contact the development team.







