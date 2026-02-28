# CivicTrack — Hyperlocal Civic Issue Reporting Platform

## Folder Structure

```
civictrack/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── issueController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Issue.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── issueRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/              ← auto-created on first run
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── IssueCard.js / .css
    │   │   ├── Navbar.js / .css
    │   │   └── ProtectedRoute.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Landing.js / .css
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Auth.css
    │   │   ├── CitizenDashboard.js
    │   │   ├── Dashboard.css
    │   │   ├── AuthorityDashboard.js / .css
    │   │   ├── ReportIssue.js / .css
    │   │   ├── IssueDetail.js / .css
    │   │   └── Profile.js / .css
    │   ├── styles/
    │   │   └── global.css
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## Dependencies

### Backend
| Package | Version | Purpose |
|---|---|---|
| express | ^4.18.2 | Web framework |
| mongoose | ^8.0.3 | MongoDB ODM |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| cors | ^2.8.5 | Cross-origin requests |
| multer | ^1.4.5-lts.1 | Image file uploads |
| dotenv | ^16.3.1 | Environment variables |
| nodemon (dev) | ^3.0.2 | Auto-restart on change |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| react | ^18.2.0 | UI library |
| react-dom | ^18.2.0 | DOM renderer |
| react-router-dom | ^6.21.0 | Client-side routing |
| axios | ^1.6.2 | HTTP client |
| react-scripts | 5.0.1 | CRA build tools |

---

## Setup & Installation

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (free tier works)
- npm or yarn

### Step 1 — Clone / Extract the project

### Step 2 — Backend Setup
```bash
cd civictrack/backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/civictrack
JWT_SECRET=your_random_secret_string_here
NODE_ENV=development
```

Start backend:
```bash
npm run dev    # development with nodemon
# OR
npm start      # production
```

### Step 3 — Frontend Setup
```bash
cd civictrack/frontend
npm install
npm start
```

Frontend runs on http://localhost:3000
Backend runs on http://localhost:5000

The `"proxy": "http://localhost:5000"` in frontend package.json automatically proxies API calls.

---

## Authority Role — How it works

Emails ending with these domains are **automatically assigned authority role**:
- gov.in
- nic.in
- mcgm.gov.in
- bmc.gov.in
- mcd.gov.in
- bbmp.gov.in
- ghmc.gov.in
- pune.gov.in
- pcmc.gov.in
- kmcgov.in
- chennaicorporation.gov.in
- and more (see authController.js)

All other emails → **citizen role**

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | — | Register user |
| POST | /api/auth/login | — | Login, get JWT |
| GET | /api/issues/stats | — | Platform stats |
| GET | /api/issues/all | ✓ | All issues (filterable) |
| GET | /api/issues/my | ✓ | My reported issues |
| GET | /api/issues/:id | ✓ | Issue details |
| POST | /api/issues | ✓ | Report new issue |
| PUT | /api/issues/:id/status | ✓ Authority | Update status |
| GET | /api/users/profile | ✓ | User profile |
