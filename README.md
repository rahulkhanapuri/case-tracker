# Case Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing case workflows with Manager and Agent roles. Built with MUI (Material-UI) and TypeScript on the frontend.

## Overview

 replaces spreadsheet-based case tracking with a modern web application. Teams can create cases, assign them to agents, track progress through a defined workflow, and record a complete audit trail of all changes.

### Features

✅ JWT authentication with role-based access control  
✅ Two roles: Manager and Agent with distinct capabilities  
✅ Case lifecycle workflow with enforced status transitions  
✅ Complete audit log for every status change  
✅ File uploads and document management  
✅ Comments and notes on each case  
✅ Search, filtering, and pagination  
✅ Responsive Material-UI design  
✅ TypeScript for type safety  

## Project Structure

```
case-tracker/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── config/   # Database and middleware config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth and validation
│   │   ├── models/   # MongoDB schemas
│   │   ├── routes/   # API routes
│   │   └── utils/    # Workflow utilities
│   ├── package.json
│   ├── index.js      # Server entry point
│   └── README.md     # Backend-specific docs
│
└── frontend/         # React/Vite application
    ├── src/
    │   ├── components/   # Reusable React components
    │   ├── contexts/     # Auth context
    │   ├── pages/        # Page components
    │   ├── services/     # API client
    │   ├── types/        # TypeScript interfaces
    │   ├── App.tsx       # Main app component
    │   └── main.tsx      # Entry point
    ├── package.json
    ├── vite.config.ts    # Vite configuration
    └── tsconfig.json     # TypeScript configuration
```

## Quick Start (Under 10 Minutes)

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm

### Step 1: Backend Setup

```bash
cd backend
npm install
```

Create/update `.env` file in the backend folder:

```
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/verifacts
JWT_SECRET=your_super_secret_key
```

Start the backend server:

```bash
npm run dev
```

You should see:
```
Server is running on http://localhost:3000
MongoDB connected: ...
```

### Step 2: Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
```

Create `.env` file in the frontend folder:

```
VITE_API_URL=http://localhost:3000/api
```

Start the frontend dev server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Workflow

### Case Status Flow

```
New → Assigned → In Progress → Submitted → Cleared/Discrepant
```

### Manager Capabilities

- ✅ Create new cases
- ✅ View all cases (with filters and search)
- ✅ Assign cases to agents
- ✅ Review submitted cases
- ✅ Mark cases as Cleared or Discrepant
- ✅ View audit logs and comments

### Agent Capabilities

- ✅ View only assigned cases
- ✅ Start work on assigned cases
- ✅ Upload supporting documents/photos
- ✅ Add notes and comments
- ✅ Submit cases for review
- ✅ View case details and audit trail

## API Endpoints

### Authentication

```
POST   /api/auth/register         Create new user
POST   /api/auth/login            Login and get JWT token
GET    /api/auth/me               Get current user (requires auth)
```

### Cases

```
GET    /api/cases                 List cases (with filters/pagination)
POST   /api/cases                 Create new case (manager only)
GET    /api/cases/:caseId         Get case details with comments/documents
POST   /api/cases/:caseId/comments                Add comment
POST   /api/cases/:caseId/documents               Upload document
POST   /api/cases/:caseId/assign                  Assign case to agent (manager)
PATCH  /api/cases/:caseId/in-progress            Start work (agent)
PATCH  /api/cases/:caseId/submit                 Submit case (agent)
PATCH  /api/cases/:caseId/review                 Review and verdict (manager)
```

## Testing the System

### Create Test Users

Login page is at `http://localhost:5173/login`

1. **Register a Manager account**
   - Name: Manager One
   - Email: manager@example.com
   - Password: password123
   - Role: Manager

2. **Register an Agent account**
   - Name: Agent One
   - Email: agent@example.com
   - Password: password123
   - Role: Agent

### Test Case Workflow

1. Login as Manager
2. Create a new case
   - Client: Acme Corp
   - Subject: John Smith
   - Type: Verification
   - Due Date: [future date]
   - Assign to: Agent One
3. Login as Agent
4. View your assigned cases
5. Click to start work
6. Upload documents
7. Add notes/comments
8. Submit case
9. Login back as Manager
10. Review and mark Cleared or Discrepant

## Deployment

### Backend (Node.js)

For production deployment:

```bash
npm run build      # If using TypeScript transpilation
npm start          # Production start command (add to package.json if needed)
```

Deploy to:
- Render

### Frontend (React)

Build for production:

```bash
cd frontend
npm run build
```

This creates an optimized build in the `dist/` folder.

Deploy to:
- Vercel

## Database Schema

### Users

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "manager" | "agent",
  isActive: Boolean,
  timestamps
}
```

### Cases

```javascript
{
  clientName: String,
  subjectName: String,
  caseType: String,
  dueDate: Date,
  status: "New" | "Assigned" | "In Progress" | "Submitted" | "Cleared" | "Discrepant",
  assignedTo: ObjectId (ref User),
  createdBy: ObjectId (ref User),
  verdict: "Cleared" | "Discrepant" | null,
  timestamps
}
```

### Documents

```javascript
{
  caseId: ObjectId (ref Case),
  originalName: String,
  fileName: String,
  path: String,
  mimeType: String,
  size: Number,
  uploadedBy: ObjectId (ref User),
  description: String,
  timestamps
}
```

### Comments

```javascript
{
  caseId: ObjectId (ref Case),
  author: ObjectId (ref User),
  message: String,
  timestamps
}
```

### Audit Logs

```javascript
{
  caseId: ObjectId (ref Case),
  changedBy: ObjectId (ref User),
  fromStatus: String,
  toStatus: String,
  note: String,
  timestamps
}
```

## Validation

- All input is validated server-side
- Email format validation
- Password minimum 6 characters
- Case fields are required
- Status transitions are enforced
- File types restricted to PDF, DOCX, JPEG, PNG, WEBP
- Maximum file size: 10MB

## Security

- Passwords hashed with bcryptjs
- JWT token-based authentication (7-day expiry)
- Role-based access control on all endpoints
- CORS enabled for frontend communication
- MongoDB ObjectID validation

## Troubleshooting

### Backend won't start

**Error: MongoDB connection failed**
- Check your `.env` file has `MONGODB_URI` set correctly
- Verify your IP address is whitelisted in MongoDB Atlas
- Ensure MongoDB Atlas cluster is running

**Error: Port 3000 already in use**
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000

### Frontend won't connect to backend

**Error: Failed to fetch / CORS error**
- Ensure backend is running on http://localhost:3000
- Check `VITE_API_URL` in frontend `.env`
- Verify backend has `cors()` middleware enabled

**Error: Module not found**
- Run `npm install` in frontend folder
- Delete `node_modules` and `package-lock.json`, then `npm install` again

