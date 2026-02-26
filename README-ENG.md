# TutoringSistem

Online tutoring platform built with a React + Spring Boot + MySQL stack.

## Contents

- Architecture overview
- Modules and features
- Security and authentication
- Local run
- Docker run
- Environment configuration
- Testing and quality checks
- Limitations and planned improvements
- Short project purpose

## Architecture overview

The system has three main layers:

- Frontend (`Frontend/tutoringfrontend`)  
  React SPA with pages for users, groups, lessons, assignments, chat, and video calls.
- Backend (`Backend/tutoring`)  
  Spring Boot REST API + WebSocket signaling, business logic, and security layer.
- Database (`MySQL`)  
  Relational model for users, groups, messages, subjects, materials, and assignments.

## Modules and features

### 1. Users and profiles

- User registration (`/api/createAccount`)
- Login and profile bootstrap (`/api/login`, `/api/welcomePage`)
- Multi-role support through `user_roles` with backward compatibility for legacy `OBOJE`
- User profile view and user search

Key files:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/UserLoginController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/UserPageController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Entities/User.java`

### 2. Groups and group access

- Group creation by professors
- Group filtering and pagination
- Student access requests to groups
- Accept, approve, and reject flows for group owner

Key files:

- `Backend/tutoring/src/main/java/com/example/tutoring/Services/GroupService.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/GroupRequestController.java`
- `Frontend/tutoringfrontend/src/components/GroupSearch.jsx`
- `Frontend/tutoringfrontend/src/components/GroupRequests.jsx`

### 3. Lessons and materials

- Lesson creation per group
- Material upload with file type validation
- Lesson and material listing per group

Key files:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/LessonController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/LessonService.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/StorageService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Lessons.jsx`

### 4. Assignments and submissions

- Assignment creation by professors
- Assignment submissions by students
- Submission review, feedback, and grading
- Access control limited to group members and group owner

Key files:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/AssignmentController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/AssignmentService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Assignments.jsx`

### 5. Chat and video call

- Direct user-to-user chat
- Group chat per group
- WebSocket signaling for in-group video calls
- Guards for invalid IDs, message size limits, and group membership validation

Key files:

- `Backend/tutoring/src/main/java/com/example/tutoring/WebSocket/ChatController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/VideoCall/VideoCallController.java`
- `Frontend/tutoringfrontend/src/minicomponents/Chat.jsx`
- `Frontend/tutoringfrontend/src/minicomponents/VideoCall.jsx`

## Security and authentication

- Access and refresh tokens via HTTP-only cookies
- JWT filter protecting API routes
- Refresh endpoint and logout endpoint
- CORS configuration through property variable
- Hardened upload storage:
  - extension whitelist
  - randomized file names
  - path traversal protection
- Upload path is no longer publicly accessible without authentication

Key files:

- `Backend/tutoring/src/main/java/com/example/tutoring/Security/AuthController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/JwtFilter.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/SecurityConfig.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/JwtUtil.java`

## Local run

### Prerequisites

- Java 25
- Node.js 20+ (recommended: 22)
- MySQL 8+

### 1. Backend

1. Create the `elearning` database in MySQL.
2. Configure credentials in `Backend/tutoring/src/main/resources/application.properties` or env variables.
3. Run:

```powershell
cd Backend/tutoring
./mvnw.cmd spring-boot:run
```

### 2. Frontend

```powershell
cd Frontend/tutoringfrontend
npm install
npm run dev
```

Frontend defaults to `http://localhost:5173`, backend to `http://localhost:8080`.

## Docker run

### 1. Prepare

1. Copy the env example:

```powershell
copy .env.docker.example .env
```

2. Set strong values in `.env` for:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JASYPT_PASSWORD`

### 2. Start

```powershell
docker compose up --build -d
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- MySQL: `localhost:3306`

Uploaded files are persisted in Docker volume `uploads_data`.

## Environment configuration

### Backend env variables

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_COOKIE_SECURE`
- `JWT_COOKIE_SAME_SITE`
- `CORS_ALLOWED_ORIGINS`
- `JASYPT_PASSWORD`

### Frontend env variables

- `VITE_APP_ENV` (`local` or `lan`)
- `VITE_BASE_URL` (backend URL override)
- `VITE_WS_BASE_URL` (frontend/ws base override)
- `VITE_ICE_SERVERS` (JSON array of ICE servers)

## Testing and quality checks

### Backend

```powershell
cd Backend/tutoring
./mvnw.cmd test
```

### Frontend

```powershell
cd Frontend/tutoringfrontend
npm run lint
npm run build
```

## Limitations and planned improvements

- Current group model uses one `headtutor` owner.
- Multi-professor support per group is marked as TODO in code and needs data model extension.
- Refresh tokens are stateless and can be further hardened with server-side revocation.
- Part of the SQL layer uses `JdbcTemplate` and can be migrated to a more consistent approach per module.

## Short project purpose

This project started as a practical way to learn and apply a Spring Boot + React workflow on a more realistic product flow. The goal was to build a functional tutoring platform with real modules such as groups, lessons, assignments, chat, and video calls, and it evolved into a more serious full-stack system over time.
