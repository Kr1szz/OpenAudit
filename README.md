# Open Audit - AI-Powered Expense Auditing System

A hackathon project for automated receipt processing and fraud detection.

## Features

- Upload receipt images/PDFs
- AI extraction of vendor, amount, date using Google Gemini Vision API
- Fraud detection rules
- PostgreSQL storage
- React dashboard

## Tech Stack

- Backend: Node.js, Express, PostgreSQL, Google Gemini AI
- Frontend: React, TypeScript, Tailwind CSS

## Setup

### Prerequisites

- Node.js
- PostgreSQL
- Google Gemini API Key (optional, uses mock data if not provided)

### Database Setup

1. Install PostgreSQL and create a database named `open_audit`.
2. Run the schema:

```bash
psql -d open_audit -f database/schema.sql
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