# TutoringSistem

Platforma za online tutorstvo izgrađena sa React + Spring Boot + MySQL stackom.

## Sadržaj

- Pregled arhitekture
- Moduli i funkcionalnosti
- Sigurnost i autentifikacija
- Pokretanje lokalno
- Pokretanje kroz Docker
- Konfiguracija okruženja
- Testiranje i provjere kvaliteta
- Ograničenja i planirana poboljšanja
- Kratka svrha projekta

## Pregled arhitekture

Sistem ima tri glavna sloja:

- Frontend (`Frontend/tutoringfrontend`)  
  React SPA sa stranicama za korisnike, grupe, lekcije, zadatke, chat i video pozive.
- Backend (`Backend/tutoring`)  
  Spring Boot REST API + WebSocket signaling, poslovna logika i sigurnosni sloj.
- Baza (`MySQL`)  
  Relacijski model za korisnike, grupe, poruke, predmete, materijale i zadatke.

## Moduli i funkcionalnosti

### 1. Korisnici i profili

- Registracija korisnika (`/api/createAccount`)
- Prijava i dohvat korisničkog profila (`/api/login`, `/api/welcomePage`)
- Podrška za više rola kroz `user_roles` i kompatibilnost sa legacy `OBOJE` modelom
- Pregled profila korisnika i pretraga korisnika

Ključni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/UserLoginController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/UserPageController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Entities/User.java`

### 2. Grupe i pristup grupama

- Kreiranje grupa od strane profesora
- Filtriranje i paginacija grupa
- Slanje zahtjeva za pristup grupi od strane studenata
- Prihvatanje, odobravanje i odbijanje zahtjeva od strane vlasnika grupe

Ključni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/Services/GroupService.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/GroupRequestController.java`
- `Frontend/tutoringfrontend/src/components/GroupSearch.jsx`
- `Frontend/tutoringfrontend/src/components/GroupRequests.jsx`

### 3. Predavanja i materijali

- Kreiranje predavanja po grupi
- Upload materijala uz validaciju tipova fajlova
- Prikaz lekcija i materijala po grupi

Ključni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/LessonController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/LessonService.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/StorageService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Lessons.jsx`

### 4. Zadaci i predaje

- Kreiranje zadataka od profesora
- Predaja zadataka od studenata
- Pregled submissiona, feedback i ocjenjivanje
- Pristup je ograničen na članove grupe i vlasnika grupe

Ključni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/AssignmentController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/AssignmentService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Assignments.jsx`

### 5. Chat i video poziv

- Direktni chat korisnik-korisnik
- Grupni chat po grupi
- WebSocket signaling za video pozive unutar grupe
- Zaštite za neispravne ID parametre, dužinu poruka i validaciju članstva u grupi

Ključni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/WebSocket/ChatController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/VideoCall/VideoCallController.java`
- `Frontend/tutoringfrontend/src/minicomponents/Chat.jsx`
- `Frontend/tutoringfrontend/src/minicomponents/VideoCall.jsx`

## Sigurnost i autentifikacija

- Access i refresh tokeni kroz HTTP-only cookie-je
- JWT filter za zaštitu API ruta
- Refresh endpoint i logout endpoint
- CORS konfiguracija iz property varijable
- Hardened upload storage:
  - whitelist ekstenzija
  - randomizirani naziv fajla
  - zaštita od path traversal pokušaja
- Upload putanja više nije javno otvorena bez autentifikacije

Ključni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/Security/AuthController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/JwtFilter.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/SecurityConfig.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/JwtUtil.java`

## Pokretanje lokalno

### Preduvjeti

- Java 25
- Node.js 20+ (preporuka: 22)
- MySQL 8+

### 1. Backend

1. Kreirati bazu `elearning` u MySQL-u.
2. U `Backend/tutoring/src/main/resources/application.properties` podesiti kredencijale ili env varijable.
3. Pokrenuti:

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

Frontend po defaultu radi na `http://localhost:5173`, backend na `http://localhost:8080`.

## Pokretanje kroz Docker

### 1. Priprema

1. Kopirati primjer env fajla:

```powershell
copy .env.docker.example .env
```

2. U `.env` postaviti jake vrijednosti za:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JASYPT_PASSWORD`

### 2. Pokretanje

```powershell
docker compose up --build -d
```

Servisi:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- MySQL: `localhost:3306`

Upload fajlovi su persistirani kroz Docker volume `uploads_data`.

## Konfiguracija okruženja

### Backend env varijable

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_COOKIE_SECURE`
- `JWT_COOKIE_SAME_SITE`
- `CORS_ALLOWED_ORIGINS`
- `JASYPT_PASSWORD`

### Frontend env varijable

- `VITE_APP_ENV` (`local` ili `lan`)
- `VITE_BASE_URL` (override backend URL)
- `VITE_WS_BASE_URL` (override frontend/ws base)
- `VITE_ICE_SERVERS` (JSON niz ICE servera)

## Testiranje i provjere kvaliteta

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

## Ograničenja i planirana poboljšanja

- Trenutni model grupe koristi jednog `headtutor` vlasnika.
- Multi-profesor model po jednoj grupi je označen kao TODO u kodu i traži proširenje data modela.
- Refresh tokeni su stateless i mogu se dodatno ojačati server-side revocation mehanizmom.
- Dio SQL sloja koristi `JdbcTemplate` i može se postepeno migrirati na konzistentniji pristup po modulima.

## Kratka svrha projekta

Projekat je nastao kao praktičan sistem za učenje i primjenu Spring Boot + React pristupa na realnijem toku rada. Fokus je bio da se napravi funkcionalna tutoring platforma sa autentičnim modulima kao što su grupe, lekcije, zadaci, chat i video pozivi, pa je vremenom evoluirao u ozbiljniji full-stack sistem.
