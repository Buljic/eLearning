# TutoringSistem

TutoringSistem je full-stack platforma za organizovano online tutorstvo i upravljanje učenjem. Sistem objedinjuje korisničke naloge, grupe, tutorski tok rada, nastavne materijale, zadatke, real-time chat i signalizaciju za video pozive u jednu koherentnu aplikaciju.

Platforma je implementirana kroz Spring Boot backend, React frontend, MySQL bazu, JWT sesije, WebSocket komunikaciju, sigurniji upload fajlova i Docker deployment podršku.

## Pregled Platforme

TutoringSistem je dizajniran oko stvarnog toka rada tutoring organizacije:

- Tutori mogu kreirati i voditi nastavne grupe.
- Studenti mogu pretraživati grupe i slati zahtjeve za pristup.
- Vlasnici grupa mogu pregledati i upravljati zahtjevima.
- Lekcije i nastavni materijali mogu se objavljivati po grupi.
- Zadaci se mogu kreirati, predavati, pregledati i ocjenjivati.
- Korisnici mogu komunicirati kroz direktni i grupni chat.
- Grupe mogu koristiti real-time signalizaciju za video sesije.

Aplikacija je strukturisana kao produkcijski orijentisan full-stack sistem, sa autentifikacijom, pristupom po rolama, perzistentnim skladištenjem, sigurnijim uploadom fajlova i deployment artefaktima unutar repozitorija.

## Arhitektura

Platforma je podijeljena u tri glavna sloja:

- Frontend: `Frontend/tutoringfrontend`
  React single-page aplikacija izgrađena sa Vite, React Router, MUI, custom hookovima i reusable komponentama.

- Backend: `Backend/tutoring`
  Spring Boot 4 aplikacija na Java 25, sa REST API rutama i WebSocket endpointima za real-time funkcionalnosti.

- Baza: `MySQL`
  Relacijsko skladište za korisnike, role, grupe, predmete, materijale, zadatke, predaje i poruke.

Docker Compose je uključen za pokretanje kompletnog stacka sa MySQL, backend i frontend containerima.

## Glavni Moduli

### Autentifikacija i Nalozi

Autentifikacija koristi HTTP-only cookie-je sa access i refresh JWT tokenima. Backend validira JWT kroz security filter i štiti API rute na nivou aplikacije.

Podržani tokovi:

- Javna registracija korisnika
- Login i učitavanje sesije
- Refresh token tok
- Logout sa čišćenjem cookie-ja
- Multi-role korisnički model
- Kompatibilnost sa starijim `OBOJE` modelom

Važni backend fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/Security/AuthController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/JwtFilter.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Security/JwtUtil.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Entities/User.java`

### Korisnici i Pretraga Tutora

Platforma podržava pretragu predmeta, pronalazak tutora po predmetu, pregled korisničkih profila i dohvat podataka za trenutno prijavljenog korisnika.

Funkcionalnosti:

- Pretraga predmeta
- Predmeti sa najviše tutora
- Lista tutora po predmetu
- Profil korisnika
- Učitavanje korisnika na osnovu aktivne sesije

Važni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/UserPageController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/UserService.java`
- `Frontend/tutoringfrontend/src/components/Subjects.jsx`
- `Frontend/tutoringfrontend/src/components/TutorsForSubject.jsx`
- `Frontend/tutoringfrontend/src/components/UserInfo.jsx`

### Grupe i Upis

Grupe predstavljaju osnovnu nastavnu jedinicu. Profesor može kreirati grupu, definisati temu, raspored, cijenu, kapacitet i povezane predmete. Studenti šalju zahtjeve za pristup, a vlasnik grupe kontroliše odobravanje.

Funkcionalnosti:

- Kreiranje grupa
- Dodjela predmeta grupi
- Pretraga i filtriranje grupa
- Paginacija
- Zahtjevi studenata za pristup
- Odobravanje i odbijanje zahtjeva
- Autorizacija bazirana na vlasniku grupe

Važni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/Services/GroupService.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/GroupRequestController.java`
- `Frontend/tutoringfrontend/src/components/CreateGroup.jsx`
- `Frontend/tutoringfrontend/src/components/GroupSearch.jsx`
- `Frontend/tutoringfrontend/src/components/GroupRequests.jsx`

### Lekcije i Materijali

Lekcije su vezane za grupe i mogu sadržavati uploadovane fajlove. Upload logika je centralizovana kroz storage servis i uključuje sigurnosne provjere.

Funkcionalnosti:

- Kreiranje lekcija od strane autorizovanih profesora
- Upload materijala po lekciji
- Pregled lekcija i materijala po grupi
- Whitelist dozvoljenih ekstenzija
- Nasumično generisana imena spremljenih fajlova
- Zaštita od path traversal pokušaja

Važni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/LessonController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/LessonService.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/StorageService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Lessons.jsx`
- `Frontend/tutoringfrontend/src/minicomponents/CreateLessonModal.jsx`

### Zadaci i Predaje

Zadaci su vezani za grupe. Studenti mogu predati fajlove, a profesori mogu pregledati predaje, dodati feedback i ocjene.

Funkcionalnosti:

- Kreiranje zadataka od vlasnika grupe
- Pregled zadataka po grupi
- Upload studentskih predaja
- Zaštita od duplih predaja
- Status zakašnjele predaje
- Feedback i ocjenjivanje
- Kontrola pristupa predajama

Važni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/RESTControllers/AssignmentController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/AssignmentService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Assignments.jsx`
- `Frontend/tutoringfrontend/src/minicomponents/AssignmentDetail.jsx`
- `Frontend/tutoringfrontend/src/minicomponents/AssignmentSubmissions.jsx`

### Chat i Real-Time Komunikacija

Chat modul koristi WebSocket/STOMP komunikaciju i podržava direktne i grupne razgovore.

Funkcionalnosti:

- Direktne poruke između korisnika
- Grupni chat po ID-u grupe
- Paginacija historije poruka
- Autentifikovane WebSocket sesije
- Validacija članstva u grupi
- Limit dužine poruka
- Zaštita od neispravnih frontend ruta

Važni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/WebSocket/WebSocketConfig.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/WebSocket/ChatController.java`
- `Backend/tutoring/src/main/java/com/example/tutoring/Services/MessageService.java`
- `Frontend/tutoringfrontend/src/minicomponents/Chat.jsx`
- `Frontend/tutoringfrontend/src/components/ChatTo.jsx`
- `Frontend/tutoringfrontend/src/components/ChatGroup.jsx`

### Signalizacija za Video Pozive

Video pozivi koriste WebRTC na klijentskoj strani i Spring WebSocket signalizaciju na backendu. Backend ne streama media sadržaj, nego koordinira prisustvo u sobi i signaling poruke između autentifikovanih članova grupe.

Funkcionalnosti:

- Video sobe vezane za grupu
- Join i leave obrada
- Relay za offer, answer i ICE candidate poruke
- Autentifikovan pristup sobi
- Validacija target korisnika
- Limit veličine signaling payload-a

Važni fajlovi:

- `Backend/tutoring/src/main/java/com/example/tutoring/VideoCall/VideoCallController.java`
- `Frontend/tutoringfrontend/src/minicomponents/VideoCall.jsx`

## Sigurnosni Model

Sigurnost je raspoređena kroz više slojeva:

- JWT access token u HTTP-only cookie-ju
- Refresh token u HTTP-only cookie-ju ograničenom na `/api/auth`
- Stateless Spring Security filter chain
- CORS konfiguracija kroz env varijable
- Autorizacija po rolama na backendu
- Provjere vlasništva grupe za profesorske akcije
- Provjere članstva u grupi za studentski pristup, grupni chat, zadatke, lekcije i video pozive
- Validacija uploadovanih fajlova kroz whitelist ekstenzija i sigurno razrješavanje putanja

Za produkcijski deployment potrebno je zamijeniti sve placeholder secret vrijednosti jakim vrijednostima specifičnim za okruženje.

## Tehnološki Stack

Backend:

- Java 25
- Spring Boot 4.0.3
- Spring Security
- Spring WebSocket
- Spring Data JPA
- JDBC Template za odabrane query tokove
- MySQL
- JJWT
- Jasypt

Frontend:

- React 18
- Vite
- React Router
- MUI
- STOMP preko SockJS
- WebRTC APIs

Infrastruktura:

- Docker
- Docker Compose
- Nginx za serviranje frontend containera
- MySQL 8.4 container

## Lokalni Development

### Preduvjeti

- Java 25
- Node.js 20 ili noviji
- MySQL 8 ili noviji

### Backend

Kreirati MySQL bazu `elearning`, podesiti kredencijale kroz env varijable ili `application.properties`, zatim pokrenuti:

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

Repozitorij uključuje kompletan Docker Compose setup za lokalno container pokretanje.

Pripremiti env varijable:

```powershell
copy .env.docker.example .env
```

Pokrenuti stack:

```powershell
docker compose up --build -d
```

Servisi:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- MySQL: `localhost:3306`

Perzistentni volume-i:

- `mysql_data` za podatke baze
- `uploads_data` za uploadovane fajlove

Zaustavljanje stacka:

```powershell
docker compose down
```

## Environment Varijable

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

## Verifikacija

Backend testovi:

```powershell
cd Backend/tutoring
./mvnw.cmd test
```

Frontend lint i produkcijski build:

```powershell
cd Frontend/tutoringfrontend
npm run lint
npm run build
```

Provjera Docker konfiguracije:

```powershell
docker compose config
```

## Trenutne Inženjerske Napomene

- Trenutni model grupe ima jednog primarnog vlasnika kroz `headtutor_id`.
- Podrška za više profesora na jednoj grupi je planirano proširenje data modela.
- Refresh tokeni su stateless; server-side token registry bi omogućio eksplicitno poništavanje refresh tokena.
- Dio backend modula koristi `JdbcTemplate`, dok drugi dio koristi JPA repozitorije. To je funkcionalno, ali budući cleanup može standardizovati persistence pristup po modulu.

## Pozicioniranje Projekta

TutoringSistem nije samo demo aplikacija. To je full-stack tutoring platforma sa stvarnim aplikacionim granicama: autentifikovane sesije, role-aware tokovi, vlasništvo nad grupama, studentski upisi, distribucija sadržaja, zadaci, direktna komunikacija, real-time signalizacija, rad sa fajlovima i containerized deployment. Codebase također odražava praktičnu evoluciju od ranijeg Spring projekta fokusiranog na učenje prema kompletnijem sistemu sa produkcijski orijentisanim brigama.
