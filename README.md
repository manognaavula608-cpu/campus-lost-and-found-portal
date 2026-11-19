# campus-lost-and-found-portal
Campus Lost and Found Portal - Sai University Project

# Campus Lost and Found Portal

## 1. Project Overview

The Campus Lost and Found Portal is a web-based application developed for Sai University. It helps students report lost and found items, search for missing belongings, and submit claims to recover their items.

The system also provides an admin dashboard to manage reported items and verify student claims.

## 2. Features

- Student registration and login
- Secure password encryption
- JWT-based authentication
- Report lost and found items
- Upload item photographs
- Search and filter reported items
- Automatic matching of lost and found items
- Submit and track item claims
- Admin dashboard
- Approve or reject student claims
- Student notifications

## 3. Technologies Used

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB Atlas
- Mongoose

**Tools**
- Visual Studio Code
- Postman
- Git and GitHub

## 4. Project Structure

```text
campus-lost-and-found/
├── frontend/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── uploads/
├── postman/
│   └── collections/
├── .env
├── .gitignore
└── package.json
```

## 5. Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/manognaavula608-cpu/campus-lost-and-found-portal.git
```

### Step 2: Open the Project Folder

```bash
cd campus-lost-and-found-portal
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root directory.

Add your own MongoDB connection string and JWT secret:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Do not upload the `.env` file or share your secret values.

### Step 5: Start the Server

```bash
npm run dev
```

The application runs locally at:

http://localhost:5000

## 6. API Testing

The backend APIs are tested using Postman.

Main API endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Register a student |
| POST | /api/auth/login | Login |
| GET | /api/items | Get all items |
| POST | /api/items | Report an item |
| GET | /api/claims/my | View my claims |
| POST | /api/claims | Submit a claim |
| GET | /api/notifications | View notifications |

The Postman collection and testing screenshots are included in the project repository.

## 7. Security

- Passwords are hashed using bcrypt.
- JWT is used for authentication.
- Protected routes require valid authentication.
- Admin routes use role-based authorization.
- Environment variables protect sensitive configuration details.

## 8. Project Outcome

The Campus Lost and Found Portal provides a centralized platform for managing lost and found items within the university campus. It makes reporting, searching, claiming, and tracking items easier for students and administrators.

## 9. Author

**Name:** Manogna A.  
**University:** Sai University  
**School:** School of Computing and Data Science  
**Section:** 4