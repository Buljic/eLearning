# TutoringSistem

A full-stack tutoring and learning management platform: user management, course groups, tutor workflows, lessons and materials, assignments with submissions and grading, direct and group chat, and real-time video-call signaling. It started in late 2023 as a Spring Boot + React + MySQL project I built while learning, and it grew from there into a system with real boundaries: JWT sessions, role-aware access control, group ownership, enrollment requests, content delivery, and containerized deployment.

The backend is Spring Boot 4 on Java 25, the frontend is a React/Vite single-page app with MUI, and MySQL does the persistence. The Bosnian version of this documentation lives in `README-BA.md`.

## Platform overview

- Tutors can create and manage learning groups.
- Students can discover groups and request access.
- Group owners review and manage access requests.
- Lessons and learning materials are published per group.
- Assignments can be created, submitted, reviewed, and graded.
- Users communicate through direct and group chat.
- Groups can use real-time video-call signaling for live sessions.

## Architecture

- Frontend: `Frontend/tutoringfrontend` - React SPA with Vite, React Router, MUI, custom hooks, and reusable components.
- Backend: `Backend/tutoring` - Spring Boot 4 application on Java 25, REST APIs plus WebSocket endpoints for real-time features.
- Database: MySQL - users, roles, groups, subjects, materials, assignments, submissions, and messages.

Docker Compose runs the full stack with MySQL, backend, and frontend containers.

## Main modules

**Authentication and accounts.** HTTP-only cookies with access and refresh JWT tokens, validated through a security filter with route-level access protection. Public registration, login and session bootstrap, refresh token flow, logout with cookie cleanup, and a multi-role user model with legacy compatibility for the older `OBOJE` role.

**User and tutor discovery.** Subject search, most active tutor subjects, tutor listing by subject, user profile pages, and session-aware current user data.

**Groups and enrollment.** Groups are the main learning unit. A professor creates a group with topic, schedule, price, capacity, and related subjects. Students request access and the group owner approves or rejects. Includes group search, filtering, and pagination.

**Lessons and materials.** Lessons attach to groups and can include uploaded files. Upload handling is centralized in a storage service with extension whitelisting, randomized stored file names, and path traversal protection.

**Assignments and submissions.** Assignments are scoped to groups. Students upload submissions, professors review them, give feedback, and assign grades. Duplicate submission protection and late submission status included.

**Chat.** WebSocket/STOMP messaging for direct and group conversations, with paginated history, authenticated sessions, group membership validation, and message length safeguards.

**Video calls.** WebRTC on the client, Spring WebSocket signaling on the backend. The backend does not stream media; it coordinates room membership and relays offer, answer, and ICE candidates between authenticated group members.

## Security model

- JWT access token in an HTTP-only cookie
- Refresh token in an HTTP-only cookie scoped to `/api/auth`
- Stateless Spring Security filter chain
- CORS configured through environment variables
- Role-aware backend authorization
- Group ownership checks for professor-only actions
- Group membership checks for student access, group chat, assignments, lessons, and video calls
- File upload validation via extension whitelisting and safe path resolution

For real deployment, replace all placeholder secrets with environment-specific values.

## Stack choices

I kept the backend on Java 25 with Spring Boot 4.0.3 because the newer LTS line gives better virtual-thread behavior and the project already relies on Spring Security, Spring WebSocket, Spring Data JPA, and JDBC Template side by side. MySQL persists the relational data, JJWT handles the tokens, and Jasypt encrypts the few secrets that live in property files.

The frontend is a React 18 single-page app built with Vite, React Router for navigation, MUI for the interface, STOMP over SockJS for chat, and plain WebRTC APIs for video signaling.

Everything ships in Docker Compose: the frontend behind Nginx, the Spring Boot backend, and a MySQL 8.4 container with persistent volumes for the database and uploaded files.

## Local development

Requirements: Java 25, Node.js 20 or newer, MySQL 8 or newer.

Backend:

```powershell
cd Backend/tutoring
./mvnw.cmd spring-boot:run
```

Create a MySQL database named `elearning` and configure credentials through environment variables or `application.properties`. Default backend URL: `http://localhost:8080`.

Frontend:

```powershell
cd Frontend/tutoringfrontend
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`.

To verify the backend tests pass, run `./mvnw.cmd test` from `Backend/tutoring`. For the frontend, run `npm run lint` and `npm run build` from `Frontend/tutoringfrontend`. I also run `docker compose config` before any deployment to catch configuration mistakes early.

## Docker deployment

```powershell
copy .env.docker.example .env
docker compose up --build -d
```

Services: frontend `http://localhost:5173`, backend `http://localhost:8080`, MySQL `localhost:3306`. Persistent volumes: `mysql_data` and `uploads_data`. Stop with `docker compose down`.

## Environment variables

Backend: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JASYPT_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRATION_MS`, `JWT_REFRESH_EXPIRATION_MS`, `JWT_COOKIE_SECURE`, `JWT_COOKIE_SAME_SITE`, `CORS_ALLOWED_ORIGINS`.

Frontend: `VITE_APP_ENV`, `VITE_BASE_URL`, `VITE_WS_BASE_URL`, `VITE_ICE_SERVERS`.

## Engineering notes

- The current group model has one primary owner through `headtutor_id`; multi-professor ownership is a planned extension.
- Refresh tokens are stateless; a server-side token registry would allow explicit revocation.
- Some backend modules use `JdbcTemplate` while others use JPA repositories. It works, but standardizing persistence per module would be a good cleanup.
- The history tells the real story: the earliest commits are from December 2023, and the security and documentation passes in early 2026 are where the project got its current shape.
