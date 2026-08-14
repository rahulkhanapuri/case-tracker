# Verifacts Backend API

A simple MERN backend for a case tracking workflow with Manager and Agent roles.

## Features

- JWT-based login with role-based access
- Manager and Agent role separation
- Case lifecycle: New → Assigned → In Progress → Submitted → Cleared / Discrepant
- Server-side transition enforcement
- Audit log for every status update
- Comments and document uploads
- Search, status filter, agent filter, and pagination
- MongoDB-backed schema for users, cases, documents, comments, and audit logs

## Prerequisites

- Node.js 18+
- MongoDB Atlas or a local MongoDB instance

## Quick start

1. Clone this repository.
2. In the backend folder, install dependencies:

   npm install

3. Create a `.env` file in the backend folder:

   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/verifacts
   JWT_SECRET=your_super_secret_key

4. Start the server:

   npm run dev

5. The API will be available at http://localhost:3000

## Default roles

You can create users directly via the register endpoint or through MongoDB. The supported roles are:

- manager
- agent

## Authentication

Example login request:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "password123"
  }'
```

Use the returned token in the Authorization header:

```bash
Authorization: Bearer <token>
```

## Main API endpoints

### Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Cases

- GET /api/cases
- POST /api/cases
- GET /api/cases/:caseId
- POST /api/cases/:caseId/comments
- POST /api/cases/:caseId/documents
- PATCH /api/cases/:caseId/assign
- PATCH /api/cases/:caseId/in-progress
- PATCH /api/cases/:caseId/submit
- PATCH /api/cases/:caseId/review

## Notes

- File uploads are stored locally in the uploads folder.
- Server-side validation is enforced on write operations.
- The case status flow is controlled on the server and cannot be bypassed from the client.
