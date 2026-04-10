# Open Audit - AI-Powered Expense Auditing System

A hackathon project for automated receipt processing and fraud detection with user authentication and role-based access.

## Features

- User registration and login
- Role-based access (user/admin)
- Upload receipt images/PDFs
- AI extraction of vendor, amount, date using Google Gemini Vision API
- Fraud detection rules
- PostgreSQL storage
- React dashboard with navigation

## Tech Stack

- Backend: Node.js, Express, PostgreSQL, JWT, Google Gemini AI
- Frontend: React, TypeScript, Tailwind CSS, React Router

## Setup

### Prerequisites

- Node.js
- PostgreSQL
- Google Gemini API Key (optional, uses mock data if not provided)

### Database Setup

1. Install PostgreSQL and create a database named `open_audit`.
2. Run the schema:

```bash
psql -d open_audit -f app/database/schema.sql
```

### Backend Setup

1. Navigate to backend directory:

```bash
cd app/backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env`:

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/open_audit
GEMINI_API_KEY=your_api_key_here  # Optional
JWT_SECRET=your_jwt_secret_key_here
```

4. Start the server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd app/frontend/open_audit
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Usage

1. Open the frontend at `http://localhost:5173`
2. Register a new account or login
3. Upload receipts and view in dashboard
4. Admins can access admin dashboard to see all receipts

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Receipts
- `POST /api/upload` - Upload receipt (authenticated)
- `GET /api/receipts` - Get receipts (user's own or all for admin)

## Roles

- **User**: Can upload and view their own receipts
- **Admin**: Can view all receipts across all users

## Project Structure

```
app/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── receiptController.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── user.js
│   │   └── receipt.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── receiptRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── fraudDetection.js
│   │   └── geminiService.js
│   └── index.js
├── frontend/open_audit/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UploadPage.tsx
│   │   │   └── AdminPage.tsx
│   │   └── App.tsx
└── database/
    └── schema.sql
```