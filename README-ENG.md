# TutoringSistem

TutoringSistem is a full-stack learning management and tutoring platform built for structured online education. It combines user management, course groups, tutor workflows, learning materials, assignments, real-time chat, and video-call signaling into one cohesive application.

The system is implemented with a Spring Boot backend, React frontend, MySQL persistence, JWT-based session handling, WebSocket messaging, hardened file uploads, and Docker-based deployment support.

## Platform Overview

TutoringSistem is designed around the core flow of a tutoring organization:

- Tutors can create and manage learning groups.
- Students can discover groups and request access.
- Group owners can review and manage access requests.
- Lessons and learning materials can be published per group.
- Assignments can be created, submitted, reviewed, and graded.
- Users can communicate through direct and group chat.
- Groups can use real-time video-call signaling for live sessions.

The application is structured as a production-oriented full-stack system, with authentication, role-aware access control, persistent storage, file upload hardening, and deployment artifacts included in the repository.

## Architecture

The platform is split into three primary layers:

- Frontend: `Frontend/tutoringfrontend`
  React single-page application built with Vite, React Router, MUI, custom hooks, and reusable components.

- Backend: `Backend/tutoring`
  Spring Boot 4 application running on Java 25, exposing REST APIs and WebSocket endpoints for real-time features.

- Database: `MySQL`
  Relational persistence for users, roles, groups, subjects, materials, assignments, submissions, and messages.

Docker Compose is provided for running the full stack with MySQL, backend, and frontend containers.

## Main Modules

### Authentication and Accounts

The authentication layer uses HTTP-only cookies with access and refresh JWT tokens. The backend validates JWTs through a security filter and applies route-level access protection.

Supported account flows include:

- Public account registration
- Login and session bootstrap
- Refresh token flow
- Logout with cookie cleanup
- Multi-role user model
- Legacy compatibility for the older `OBOJE` role model

Important backend files:

- `Backend/tutoring/src/main/java/com/example/tutoring/Security/AuthController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/JwtFilter.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/JwtUtil.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Entities/User.java`

### User and Tutor Discovery

The platform supports public subject discovery, tutor lookup by subject, user profile lookup, and authenticated user data loading.

Features include:

- Subject search
- Most active tutor subjects
- Tutor listing by subject
- User profile page
- Session-aware current user data

Important files:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/UserPageController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/UserService.java`
- `Frontend/tutoringfrontend/src/components/Subjects.jsx`
- `Frontend/tutoringfrontend/src/components/TutorsForSubject.jsx`
- `Frontend/tutoringfrontend/src/components/UserInfo.jsx`

### Groups and Enrollment

Groups represent the main learning unit. A professor can create a group, define its topic, schedule, price, capacity, and related subjects. Students can request access, while the group owner controls approval.

Features include:

- Group creation
- Subject assignment per group
- Group search and filtering
- Pagination
- Student access requests
- Request approval and rejection
- Owner-based authorization

Important files:

- `Backend/tutoring/src/main/java/com/example/tutoring/Services/GroupService.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/GroupRequestController.java`
- `Frontend/tutoringfrontend/src/components/CreateGroup.jsx`
- `Frontend/tutoringfrontend/src/components/GroupSearch.jsx`
- `Frontend/tutoringfrontend/src/components/GroupRequests.jsx`

### Lessons and Materials

Lessons are attached to groups and can include uploaded files. Upload handling is centralized through the storage service and includes validation safeguards.

Features include:

- Lesson creation by authorized professors
- Material upload per lesson
- Group-scoped lesson listing
- File extension whitelist
- Randomized stored file names
- Path traversal protection

Important files:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/LessonController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/LessonService.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/StorageService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Lessons.jsx`
- `Frontend/tutoringfrontend/src/minicomponents/CreateLessonModal.jsx`

### Assignments and Submissions

Assignments are scoped to groups. Students can submit files, and professors can review submissions, provide feedback, and assign grades.

Features include:

- Assignment creation by group owner
- Assignment listing per group
- Student submission upload
- Duplicate submission protection
- Late submission status
- Feedback and grading flow
- Access control for submissions

Important files:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/AssignmentController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/AssignmentService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Assignments.jsx`
- `Frontend/tutoringfrontend/src/minicomponents/AssignmentDetail.jsx`
- `Frontend/tutoringfrontend/src/minicomponents/AssignmentSubmissions.jsx`

### Chat and Real-Time Communication

The chat module uses WebSocket/STOMP messaging and supports both direct and group conversations.

Features include:

- Direct user-to-user messages
- Group chat by group ID
- Message history pagination
- Authenticated WebSocket sessions
- Group membership validation
- Message length safeguards
- Invalid route protection on the frontend

Important files:

- `Backend/tutoring/src/main/java/com/example/tutoring/WebSocket/WebSocketConfig.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/WebSocket/ChatController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/MessageService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Chat.jsx`
- `Frontend/tutoringfrontend/src/components/ChatTo.jsx`
- `Frontend/tutoringfrontend/src/components/ChatGroup.jsx`

### Video Call Signaling

Video calls use WebRTC on the client side and Spring WebSocket signaling on the backend. The backend does not stream media. It coordinates room membership and signaling messages between authenticated group members.

Features include:

- Group-scoped video rooms
- Join and leave handling
- Offer, answer, and ICE candidate relay
- Authenticated room access
- Target user validation
- Payload size safeguards

Important files:

- `Backend/tutoring/src/main/java/com/example/tutoring/VideoCall/VideoCallController.java`
- `Frontend/tutoringfrontend/src/minicomponents/VideoCall.jsx`

## Security Model

Security is handled across multiple layers:

- JWT access token stored in an HTTP-only cookie
- Refresh token stored in an HTTP-only cookie scoped to `/api/auth`
- Stateless Spring Security filter chain
- CORS configured through environment variables
- Role-aware backend authorization
- Group ownership checks for professor-only actions
- Group membership checks for student access, group chat, assignments, lessons, and video calls
- File upload validation through extension whitelisting and safe path resolution

For production deployment, replace all placeholder secrets with strong environment-specific values.

## Technology Stack

Backend:

- Java 25
- Spring Boot 4.0.3
- Spring Security
- Spring WebSocket
- Spring Data JPA
- JDBC Template for selected query flows
- MySQL
- JJWT
- Jasypt

Frontend:

- React 18
- Vite
- React Router
- MUI
- STOMP over SockJS
- WebRTC APIs

Infrastructure:

- Docker
- Docker Compose
- Nginx for frontend container serving
- MySQL 8.4 container

## Local Development

### Requirements

- Java 25
- Node.js 20 or newer
- MySQL 8 or newer

### Backend

Create a MySQL database named `elearning`, configure credentials through environment variables or `application.properties`, then run:

```powershell
cd Backend/tutoring
./mvnw.cmd spring-boot:run
```

Default backend URL:

```text
http://localhost:8080
```

### Frontend

```powershell
cd Frontend/tutoringfrontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

## Docker Deployment

The repository includes a full Docker Compose setup for local containerized execution.

Prepare environment variables:

```powershell
copy .env.docker.example .env
```

Start the stack:

```powershell
docker compose up --build -d
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- MySQL: `localhost:3306`

Persistent volumes:

- `mysql_data` for database data
- `uploads_data` for uploaded files

Stop the stack:

```powershell
docker compose down
```

## Environment Variables

Backend:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JASYPT_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRATION_MS`
- `JWT_REFRESH_EXPIRATION_MS`
- `JWT_COOKIE_SECURE`
- `JWT_COOKIE_SAME_SITE`
- `CORS_ALLOWED_ORIGINS`

Frontend:

- `VITE_APP_ENV`
- `VITE_BASE_URL`
- `VITE_WS_BASE_URL`
- `VITE_ICE_SERVERS`

## Verification

Backend tests:

```powershell
cd Backend/tutoring
./mvnw.cmd test
```

Frontend lint and production build:

```powershell
cd Frontend/tutoringfrontend
npm run lint
npm run build
```

Docker configuration check:

```powershell
docker compose config
```

## Current Engineering Notes

- The current group model has one primary group owner through `headtutor_id`.
- Multi-professor ownership per group is a planned data model extension.
- Refresh tokens are stateless; a server-side token registry would allow explicit refresh token revocation.
- Some backend modules use `JdbcTemplate`, while others use JPA repositories. This is functional, but a future cleanup could standardize persistence patterns by module.

## Project Positioning

TutoringSistem is not just a demo application. It is a full-stack tutoring platform with real application boundaries: authenticated sessions, role-aware workflows, group ownership, student enrollment, content delivery, assignments, direct communication, real-time signaling, file handling, and containerized deployment. The codebase also reflects a practical evolution from an earlier learning-focused Spring project into a more complete system with production-oriented concerns.
