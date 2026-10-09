# ProjectFlow — Project Management System

A full-stack project management application with a **Spring Boot** backend, **React** web frontend, and **React Native (Expo)** mobile app — all sharing the same backend API and MySQL database.

---

## 🗂️ Repository Structure

```
Project Management App/
├── backend/          # Spring Boot REST API
├── frontend/         # React (Vite) web app
└── mobile/           # React Native (Expo) mobile app
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8+
- Android Studio (for mobile)

---

## 🔧 Backend Setup (Spring Boot)

### 1. Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE project_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Environment Variables

Set the following environment variables before running the backend. The `application.properties` uses placeholders that read from these variables:

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `project_management` |
| `DB_USERNAME` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | *(empty)* |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | *built-in default* |
| `JWT_EXPIRATION` | Token expiry in ms | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

**PowerShell (Windows):**
```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="yourpassword"
```

**Linux/macOS:**
```bash
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
```

### 3. Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

Tables are created automatically by JPA (`spring.jpa.hibernate.ddl-auto=update`).

---

## 🌐 Frontend Setup (React + Vite)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

The frontend uses a Vite proxy — no additional config needed for local development. The `.env` file already points to `http://localhost:8080/api`.

For production, update `VITE_API_URL` in `frontend/.env`.

### 3. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📱 Mobile Setup (React Native + Expo)

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Configure backend URL

Edit `mobile/src/api/index.js` and update `BASE_URL`:

```js
// Android emulator → backend on your machine
const BASE_URL = 'http://10.0.2.2:8080/api'

// Physical Android device → use your machine's local IP
const BASE_URL = 'http://192.168.1.x:8080/api'

// Deployed backend
const BASE_URL = 'https://your-backend.com/api'
```

### 3. Run the app

```bash
# Android (emulator or device)
npm run android

# iOS (macOS only)
npm run ios

# Expo Go (scan QR code)
npm start
```

> **Token Security:** The JWT token is stored in **Android Keystore** via `expo-secure-store`. It is never stored in plain AsyncStorage.

---

## 📡 API Documentation

Base URL: `http://localhost:8080`

All authenticated endpoints require header:
```
Authorization: Bearer <token>
```

All responses follow the format:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00"
}
```

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login and get token | ❌ |
| POST | `/api/auth/logout` | Logout (client-side) | ✅ |
| GET | `/api/auth/me` | Get current user info | ✅ |

**Register body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

---

### Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects?search=name` | Search by name |
| GET | `/api/projects?status=IN_PROGRESS` | Filter by status |
| GET | `/api/projects/{id}` | Get project by ID |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |

**Project status values:** `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`

**Create/Update body:**
```json
{
  "name": "Website Redesign",
  "description": "Redesign the company website",
  "status": "IN_PROGRESS",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}
```

---

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks?projectId=1` | Tasks for a project |
| GET | `/api/tasks?status=PENDING` | Filter by status |
| GET | `/api/tasks?priority=HIGH` | Filter by priority |
| GET | `/api/tasks?search=name` | Search by name |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

**Task status values:** `PENDING`, `IN_PROGRESS`, `COMPLETED`

**Task priority values:** `LOW`, `MEDIUM`, `HIGH`

**Create/Update body:**
```json
{
  "name": "Design homepage",
  "description": "Create Figma mockups",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2024-03-15",
  "projectId": 1
}
```

---

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Get user statistics |

**Response:**
```json
{
  "totalProjects": 5,
  "totalTasks": 20,
  "completedTasks": 8,
  "pendingTasks": 7,
  "inProgressTasks": 5,
  "projectsNotStarted": 1,
  "projectsInProgress": 3,
  "projectsCompleted": 1
}
```

---

## 🗄️ Database Schema (ER Diagram)

```
users
  id          BIGINT PK AUTO_INCREMENT
  full_name   VARCHAR(100) NOT NULL
  email       VARCHAR(150) NOT NULL UNIQUE
  password    VARCHAR(255) NOT NULL  -- bcrypt hashed
  created_at  DATETIME NOT NULL

projects
  id           BIGINT PK AUTO_INCREMENT
  name         VARCHAR(200) NOT NULL
  description  TEXT
  status       ENUM(NOT_STARTED, IN_PROGRESS, COMPLETED)
  start_date   DATE
  end_date     DATE
  created_at   DATETIME NOT NULL
  updated_at   DATETIME
  owner_id     BIGINT FK → users.id (CASCADE DELETE)

tasks
  id           BIGINT PK AUTO_INCREMENT
  name         VARCHAR(200) NOT NULL
  description  TEXT
  priority     ENUM(LOW, MEDIUM, HIGH)
  status       ENUM(PENDING, IN_PROGRESS, COMPLETED)
  due_date     DATE
  created_at   DATETIME NOT NULL
  updated_at   DATETIME
  project_id   BIGINT FK → projects.id (CASCADE DELETE)
  owner_id     BIGINT FK → users.id (CASCADE DELETE)
```

---

## 🔒 Security

- **Passwords** hashed with **BCrypt** (never stored in plain text)
- **JWT** tokens signed with HMAC-SHA256
- **Authorization**: Users can only access their own data — enforced at service layer
- **Rate limiting**: 10 requests/minute per IP on `/api/auth/register` and `/api/auth/login` (Bucket4J)
- **SQL injection prevention**: All queries use JPA/Hibernate ORM (no raw SQL)
- **CORS**: Configured to only allow specific origins
- **Input validation**: Bean Validation on all request DTOs
- **Secure storage**: JWT stored in Android Keystore via `expo-secure-store`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA |
| Database | MySQL 8, Hibernate ORM |
| Authentication | JWT (JJWT 0.12), BCrypt |
| Rate Limiting | Bucket4J |
| Web Frontend | React 18, Vite, React Router v6, React Hook Form, Axios |
| Mobile | React Native (Expo), React Navigation, expo-secure-store |

---

## 📋 Features

### Web App
- ✅ User registration and login
- ✅ Dashboard with project and task statistics
- ✅ Create, view, edit, delete projects
- ✅ Progress bar for each project
- ✅ Create, edit, delete tasks per project
- ✅ Mark tasks complete/incomplete with checkbox
- ✅ Search projects and tasks
- ✅ Filter by status and priority
- ✅ Form validation with error messages
- ✅ Loading states and error handling
- ✅ Responsive design

### Mobile App
- ✅ Login/Register with same account as web
- ✅ Dashboard with pull-to-refresh
- ✅ Projects list with search
- ✅ Project detail with task list and progress
- ✅ Tasks list with search, status and priority filters
- ✅ Mark tasks complete/incomplete
- ✅ Create and edit tasks
- ✅ Pull-to-refresh on all screens
- ✅ Token stored in Android Keystore (expo-secure-store)
- ✅ Network error messages (no crashes)
- ✅ Expired token → redirect to login with message

---

## 🧪 Test Credentials

Use the registration form to create an account. No seed data is pre-loaded.

---

## 📝 Notes

- The backend must be running before the frontend/mobile can work
- JPA auto-creates all tables on first startup
- Both web and mobile use the **same backend** — data is shared in real time
- Pull-to-refresh on mobile shows changes made on web
