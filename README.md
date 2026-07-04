# 📋 TaskFlow Pro — Task Management System

> A production-ready, full-stack task management web application built with React and Node.js.

![TaskFlow Pro](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

---

## 📖 Project Description

**TaskFlow Pro** is a secure, multi-tenant task management system where users can register, log in, and manage their personal tasks with full CRUD capabilities. The application supports task prioritization, status tracking, pagination, search, and real-time progress statistics.

The system implements a strict **user-based data isolation** model — every user can only view, create, edit, and delete their own tasks. The backend enforces this at the database query level using compound MongoDB filters.

---

## ✨ Features

- 🔐 **Secure Authentication** — Register and login with JWT-based authentication stored in HTTP-only cookies
- 👤 **User Profile Management** — Update display name, avatar, and change password securely
- ✅ **Full Task CRUD** — Create, read, update, and delete tasks
- 🏷️ **Priority & Status Tags** — Assign priority (`Low`, `Medium`, `High`) and status (`Pending`, `In Progress`, `Completed`)
- 📅 **Due Date Tracking** — Set ISO-format due dates with validation
- 🔍 **Search & Filter** — Search tasks by title/description, filter by status or priority
- 📄 **Pagination & Sorting** — Browse tasks page-by-page with configurable limit and sort order
- 📊 **Task Statistics Dashboard** — Live summary of total, completed, pending, and in-progress tasks with a completion percentage
- 🛡️ **Security Hardened** — Helmet headers, CORS restrictions, rate-limiting, atomic ownership checks
- ⚡ **Blazing Fast Frontend** — Built with Vite + React 19, animated via Framer Motion

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express.js** | HTTP server and routing framework |
| **MongoDB Atlas** | Cloud NoSQL database |
| **Mongoose** | MongoDB ODM and schema validation |
| **JSON Web Token (JWT)** | Stateless user authentication |
| **bcryptjs** | Password hashing |
| **express-validator** | Request body validation |
| **Helmet** | HTTP security headers |
| **CORS** | Cross-origin request control |
| **express-rate-limit** | DDoS / brute-force protection |
| **cookie-parser** | HTTP-only cookie handling |
| **morgan** | HTTP request logging |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI component framework |
| **Vite** | Ultra-fast dev server and bundler |
| **React Router DOM v6** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **React Hook Form** | Performant form management |
| **Zod** | Schema-based form validation |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Animations and transitions |
| **React Hot Toast** | Toast notification system |
| **Lucide React** | Icon library |

---

## 📁 Folder Structure

```
Task Management System/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js      # Auth request handlers
│   │   └── taskController.js      # Task request handlers
│   ├── errors/
│   │   ├── NotFoundError.js       # 404 custom error class
│   │   ├── UnauthorizedError.js   # 401 custom error class
│   │   └── ForbiddenError.js      # 403 custom error class
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification & user injection
│   │   ├── errorMiddleware.js     # Global error handler
│   │   └── validationMiddleware.js# express-validator runner
│   ├── models/
│   │   ├── User.js                # Mongoose user schema
│   │   └── Task.js                # Mongoose task schema
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/* routes
│   │   └── taskRoutes.js          # /api/tasks/* routes
│   ├── services/
│   │   ├── authService.js         # Auth business logic
│   │   └── taskService.js         # Task business logic
│   ├── utils/
│   │   ├── asyncHandler.js        # Async error wrapper
│   │   └── logger.js              # Winston logger
│   ├── validators/
│   │   ├── authValidator.js       # Auth input validation rules
│   │   └── taskValidator.js       # Task input validation rules
│   ├── .env                       # Environment variables (not committed)
│   ├── package.json
│   └── server.js                  # Express app entry point
│
├── frontend/
│   └── src/
│       ├── api/                   # Axios API configuration
│       ├── components/
│       │   └── ProtectedRoute.jsx # Auth guard for private routes
│       ├── context/               # React Context (AuthContext)
│       ├── layouts/               # Shared page layout components
│       ├── pages/
│       │   ├── Dashboard.jsx      # Main task management page
│       │   ├── Login.jsx          # Login page
│       │   ├── Register.jsx       # Registration page
│       │   ├── Profile.jsx        # User profile & password page
│       │   └── NotFound.jsx       # 404 fallback page
│       ├── App.jsx                # Root component with RouterProvider
│       └── main.jsx               # React DOM entry point
│
├── AI_Usage_Report.md             # Detailed AI tool usage documentation
├── TaskFlow_Pro.postman_collection.json  # API testing collection
└── README.md
```

---

## 🌐 API Endpoints

**Production Base URL**: `https://task-managment-system-edwz.onrender.com/api`  
**Local Base URL**: `http://localhost:5000/api`

### 🔑 Auth Routes — `/api/auth`
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register a new user account |
| `POST` | `/login` | ❌ | Login and receive JWT token |
| `POST` | `/logout` | ❌ | Clear the auth cookie |
| `GET` | `/me` | ✅ | Get current user profile |
| `PUT` | `/profile` | ✅ | Update name or avatar |
| `PUT` | `/change-password` | ✅ | Change account password |

### 📝 Task Routes — `/api/tasks`
> All task routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a new task |
| `GET` | `/` | Get all tasks (paginated, filterable) |
| `GET` | `/statistics` | Get task progress statistics |
| `GET` | `/:id` | Get a specific task by ID |
| `PUT` | `/:id` | Update a specific task |
| `DELETE` | `/:id` | Delete a specific task |

#### GET `/api/tasks` — Query Parameters
| Param | Type | Example | Description |
|---|---|---|---|
| `search` | string | `fix bug` | Search in title and description |
| `status` | string | `Pending` | Filter by task status |
| `priority` | string | `High` | Filter by task priority |
| `sortBy` | string | `dueDate` | Sort order (newest/oldest/dueDate/priority) |
| `page` | number | `1` | Page number for pagination |
| `limit` | number | `10` | Results per page |

---

## ⚙️ Environment Variables

Create a `.env` file in the `/backend` directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=<AppName>

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=1d
JWT_COOKIE_EXPIRE=1

# CORS
CORS_ORIGIN=http://localhost:5173
```

> ⚠️ **Never commit your `.env` file to version control.** It is included in `.gitignore` by default.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- A MongoDB Atlas free-tier cluster (or local MongoDB)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/task-management-system.git
cd task-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create your `.env` file in `/backend` (see **Environment Variables** above).

```bash
npm run dev
# Server starts at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# Frontend starts at http://localhost:5173
```

### 4. Import Postman Collection *(optional)*
Import `TaskFlow_Pro.postman_collection.json` into Postman to test all API endpoints.

---

## 🌍 Deployment Links

| Service | URL |
|---|---|
| **🖥️ Frontend (Vercel)** | [https://task-managment-system-ashen.vercel.app](https://task-managment-system-ashen.vercel.app/login) |
| **⚙️ Backend (Render)** | [https://task-managment-system-edwz.onrender.com](https://task-managment-system-edwz.onrender.com) |
| **🌿 Database (MongoDB Atlas)** | Hosted on MongoDB Atlas cloud cluster |


---

## 🤖 AI Tool Usage

This project was developed with assistance from **Cursor IDE** (AI-powered code editor).

| Area | AI Contribution |
|---|---|
| Schema Design | Mongoose model structure and enum validations |
| Controller Boilerplate | Express async handler pattern for CRUD functions |
| Validation Rules | express-validator chains for auth and task inputs |
| Query Builder | Pagination, filter, and sort logic in `taskService.js` |

### Manual Overrides Made
- **IDOR Security Fix**: AI-generated queries used `findByIdAndUpdate(id)` without checking task ownership. Manually rewritten to `findOneAndUpdate({ _id: id, userId })`.
- **Aggregation ObjectId Casting**: AI failed to cast `userId` string to `mongoose.Types.ObjectId` inside the `$match` aggregation stage, causing empty statistics. Fixed manually.
- **Compound Indexes**: AI did not generate database indexes. Manually added four compound indexes on the Task schema for multi-tenant query optimization.

> 📄 Full details in [AI_Usage_Report.md](./AI_Usage_Report.md)

---

## 🧩 Challenges Faced

1. **JWT + Cookie Strategy**: Configuring HTTP-only cookies to work seamlessly with CORS credential mode required careful alignment of `sameSite`, `secure`, and `credentials` flags across client and server.
2. **IDOR Vulnerability**: The initial AI-generated queries did not scope database access per user. Significant refactoring was required to implement secure atomic queries.
3. **MongoDB Aggregation Typing**: The `$match` aggregation stage requires a MongoDB `ObjectId` — not a plain string — which caused zero results in the statistics endpoint until the explicit casting was added.
4. **Framer Motion + React 19**: Some animation APIs shifted between versions, requiring manual adjustments to the animation variants in dashboard components.
5. **Rate Limiting on Development**: The `express-rate-limit` middleware was accidentally blocking repeated test requests during development. Devised environment-aware limits to solve this.

---

## 🔮 Future Improvements

- [ ] **Task Labels / Tags** — Multi-label categorization beyond status and priority
- [ ] **Team Workspaces** — Shared task boards for collaborative environments
- [ ] **File Attachments** — Attach documents or images to tasks (S3 integration)
- [ ] **Email Notifications** — Due date reminders via Nodemailer or SendGrid
- [ ] **Drag-and-Drop Board View** — Kanban-style interface using react-beautiful-dnd
- [ ] **Dark Mode** — Persistent user theme preference
- [ ] **Mobile App** — React Native companion app for iOS and Android
- [ ] **Audit Logs** — Track change history per task

---

## 📝 License

This project was built as part of an academic assignment. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ using React, Node.js, Express, and MongoDB</strong>
</div>
