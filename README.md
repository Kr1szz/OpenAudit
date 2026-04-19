# Open Audit - AI-Powered Expense Auditing System

You can try Open Audit on: https://open-audit-dusky.vercel.app/

An intelligent expense management platform that uses AI to extract data from receipts, detect fraud, calculate taxes, and provide actionable financial insights.

##  Quick Start

```bash
# Clone the repository
git clone https://github.com/<your-org>/OpenAudit.git
cd OpenAudit

# Install backend dependencies and start backend server
cd backend
npm install
npm run dev

# In a new terminal, install frontend dependencies and start frontend server
cd ../frontend/open_audit
npm install
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend runs on `http://localhost:5173`.

## ✨ Features

### Receipt Management
- Upload receipts in PDF, JPEG, and PNG formats
- AI-powered extraction using Google Gemini API
- Automatic vendor, amount, date, and category extraction
- Duplicate receipt detection
- Fraud flagging system

### Tax Calculation
- Old regime vs. new regime tax computation (Indian tax system)
- Support for deductions (80C investments, HRA, standard deductions)
- HRA exemption calculations
- Real-time tax savings comparison

### User Management
- JWT-based authentication with bcrypt password hashing
- Role-based access control (user/admin roles)
- Secure profile management
- Protected routes and endpoints

### Dashboard Analytics
- View all uploaded receipts with detailed breakdown
- Track total expenses
- Identify and manage flagged receipts
- Analytics on spending patterns

## 🛠 Tech Stack

**Backend:**
- Node.js + Express.js v5.2.1 (REST API)
- PostgreSQL (via Neon cloud database)
- Google Generative AI (Gemini 1.5-flash)
- Multer for file uploads and storage
- JWT (jsonwebtoken) for authentication
- bcrypt for password hashing

**Frontend:**
- React 19.2.4 with TypeScript
- React Router v7.14.0 for navigation
- Axios v1.15.0 for HTTP requests
- Tailwind CSS v3.4.1 for styling
- React Context API for state management

##  Prerequisites

- Node.js v18 or higher
- PostgreSQL database (Neon recommended for cloud)
- Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/))
- npm or yarn

##  Getting Started

### 1. Database Setup

First, create your PostgreSQL database:

```bash
# Using Neon (cloud)
# Create a project at https://neon.tech and copy the connection string

# Or using local PostgreSQL
createdb open_audit
```

Initialize the database schema:

```bash
cd app
psql <DATABASE_URL> -f database/schema.sql
```

### 2. Backend Setup

```bash
cd app/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here
EOF

# Start the development server
npm run dev
```

> Create a `.env` file in `backend/` with the values above before starting the server.
> `DATABASE_URL` should point to your PostgreSQL instance, `GEMINI_API_KEY` must be valid, and `JWT_SECRET` is used for auth token signing.

The backend will run on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd app/frontend/open_audit

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on **http://localhost:5173**

##  Project Structure

```
app/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── receiptController.js  # Receipt upload & fetch handlers
│   │   ├── authController.js     # Auth handlers
│   │   └── taxController.js      # Tax calculation handlers
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── upload.js             # Multer configuration
│   ├── models/
│   │   ├── user.js               # User model with bcrypt
│   │   ├── receipt.js            # Receipt data model
│   │   └── tax.js                # Tax calculation model
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── receiptRoutes.js      # /api/upload, /api/receipts
│   │   └── taxRoutes.js          # /api/tax endpoints
│   ├── services/
│   │   ├── geminiServices.js     # AI receipt extraction
│   │   ├── authService.js        # JWT token management
│   │   └── fraudDetection.js     # Fraud detection logic
│   ├── uploads/                  # Uploaded receipt files
│   ├── index.js                  # Express app setup
│   └── package.json
│
├── frontend/
│   └── open_audit/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Navbar.tsx           # Navigation bar
│       │   │   └── ProtectedRoute.tsx   # Route protection wrapper
│       │   ├── contexts/
│       │   │   └── AuthContext.tsx      # Global auth state
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx
│       │   │   ├── RegisterPage.tsx
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── UploadPage.tsx
│       │   │   ├── AdminPage.tsx
│       │   │   └── TaxPage.tsx
│       │   ├── App.tsx                  # Main app component
│       │   ├── main.tsx                 # Entry point
│       │   ├── index.css
│       │   └── App.css
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── database/
│   └── schema.sql                # PostgreSQL schema
└── README.md
```

##  API Endpoints

### Authentication
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Register new user |
| POST | `/api/auth/login` | `{email, password}` | Login user, returns JWT |
| GET | `/api/auth/profile` | - | Get logged-in user profile (requires auth) |

### Receipts
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | `multipart/form-data (receipt)` | Upload receipt for processing (requires auth) |
| GET | `/api/receipts` | - | Get all user receipts (requires auth) |

### Tax Calculation
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/tax/calculate` | `{annualIncome, investments, otherDeductions, rentPaid}` | Calculate tax for both regimes (requires auth) |
| GET | `/api/tax/history` | - | Get tax calculation history (requires auth) |

##  Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require JWT authentication:

```
Authorization: Bearer <jwt_token>
```

##  Receipt Upload

Supported formats:
- PDF (application/pdf)
- JPEG (image/jpeg)
- PNG (image/png)
- Maximum file size: 10MB

The system extracts:
- Vendor/Store name
- Total amount
- Purchase date
- Category (inferred)
- Item details
- Confidence score

##  Fraud Detection

The system flags receipts for:
- Unusually high amounts (> ₹10,000)
- Missing critical fields
- Duplicate transactions (same vendor + amount)
- Invalid or suspicious data patterns

##  Tax Calculation

### Old Regime
- Basic deductions: 80C, HRA, standard deduction
- HRA exemption based on rent paid vs. basic salary
- Progressive tax slabs

### New Regime
- Higher standard deduction (₹75,000)
- Simplified without 80C/HRA deductions
- Competitive tax rates

##  Development

### Running Both Servers

Terminal 1 - Backend:
```bash
cd app/backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd app/frontend/open_audit
npm run dev
```

### Key Files to Know

- **Authentication**: `backend/services/authService.js`, `backend/middleware/authMiddleware.js`
- **Receipt Processing**: `backend/services/geminiServices.js`, `backend/controllers/receiptController.js`
- **Database Pool**: `backend/config/db.js`
- **Frontend State**: `frontend/src/contexts/AuthContext.tsx`

##  Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check DATABASE_URL and ensure PostgreSQL is running |
| Port 5000 in use | Change PORT in .env or kill the process using the port |
| Receipt extraction fails | Verify GEMINI_API_KEY is valid; check file format/size |
| Database connection error | Verify connection string and network access to database |
| Frontend auth errors | Clear browser localStorage and .env JWT_SECRET |
| CORS errors | Backend must be running on http://localhost:5000 |

##  Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, Render, or DigitalOcean
- Set environment variables on deployment platform
- Ensure PostgreSQL database is accessible

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Update API URL to production backend

##  Sample Data

The system includes mock data generation for testing without Gemini API key configured.

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

##  Environment Variables Reference

```env
# Backend
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key_min_32_chars

# Frontend (optional, if using .env)
VITE_API_URL=http://localhost:5000
```

##  Resources

- [Google Gemini API Docs](https://ai.google.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

##  License

MIT License - Feel free to use this project for learning and commercial purposes.

## Team

Built during the FantomCode Hackathon 2026

---

**Happy Auditing! **

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/open_audit
GEMINI_API_KEY=your_api_key_here  # Optional
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
2. Upload a receipt image
3. View extracted data in the dashboard
4. Check for flagged receipts

## API Endpoints

- `POST /api/upload` - Upload receipt
- `GET /api/receipts` - Get all receipts

## Project Structure

```
app/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── index.js
├── frontend/open_audit/
│   ├── src/
│   │   ├── pages/
│   │   └── App.tsx
└── database/
    └── schema.sql
```
