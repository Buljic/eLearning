package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.CreateAccountDTO;
import com.example.tutoring.Entities.Student;
import com.example.tutoring.Entities.Tutor;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Repositories.StudentRepository;
import com.example.tutoring.Repositories.TutorRepository;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Security.EncryptionUtility;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.EnumSet;
import java.util.Set;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class UserLoginController
{
    private static final Logger logger = LoggerFactory.getLogger(UserLoginController.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[0-9+\\-\\s]{6,20}$");
    private static final int MAX_USERNAME_LENGTH = 64;
    private static final int MAX_NAME_LENGTH = 80;
    private static final int MAX_SURNAME_LENGTH = 80;
    private static final int MAX_EMAIL_LENGTH = 254;
    private static final int MAX_PHONE_LENGTH = 20;
    private static final int MAX_PASSWORD_LENGTH = 128;
    private static final Set<AccountType> SELF_REGISTRATION_ALLOWED_TYPES = EnumSet.of(
            AccountType.STUDENT,
            AccountType.PROFESOR,
            AccountType.OBOJE
    );
    private final UserRepository userRepository;
    private final TutorRepository tutorRepository;
    private final StudentRepository studentRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final EncryptionUtility encryptionUtility;

    UserLoginController(UserRepository userRepository, TutorRepository tutorRepository,
                        StudentRepository studentRepository, UserService userService, JwtUtil jwtUtil,
                        BCryptPasswordEncoder bCryptPasswordEncoder, EncryptionUtility encryptionUtility)

    {
        this.userRepository=userRepository;
        this.tutorRepository = tutorRepository;
        this.studentRepository = studentRepository;
        this.userService = userService;
        this.jwtUtil=jwtUtil;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.encryptionUtility = encryptionUtility;
    }


    @PostMapping("/createAccount")//request body uzima json npr koji je poslan s requestom
    public ResponseEntity<?> createAccount(@RequestBody CreateAccountDTO createAccountDTO)
    {//na osnovu odredjenog enuma , ovisi kakav account kreiras
        String validationError = validateCreateAccountPayload(createAccountDTO);
        if (validationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(validationError);
        }

        AccountType requestedAccountType = createAccountDTO.getAccountType();
        if (requestedAccountType == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tip naloga je obavezan");
        }
        if (!SELF_REGISTRATION_ALLOWED_TYPES.contains(requestedAccountType)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Odabrani tip naloga nije dozvoljen za samostalnu registraciju.");
        }

        String normalizedUsername = createAccountDTO.getUsername().trim();
        if (userRepository.existsByUsernameIgnoreCase(normalizedUsername))
        {
          return  ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Korisnicko ime vec postoji");
        }

        String normalizedPhone = normalizePhone(createAccountDTO.getPhoneNumber());
        String encryptedPhone = normalizedPhone.isBlank() ? null : encryptionUtility.encrypt(normalizedPhone);
        User user=new User(normalizedUsername,bCryptPasswordEncoder.encode(createAccountDTO.getPassword())
        ,createAccountDTO.getName().trim(),
                createAccountDTO.getSurname().trim(),
                encryptionUtility.encrypt(createAccountDTO.getEmail().trim()),
                encryptedPhone,
                requestedAccountType);
        user.setRoles(resolveInitialRoles(requestedAccountType));
        userRepository.save(user);
        switch (requestedAccountType) {
            case STUDENT -> {
                Student student = new Student();
                student.setUser(user);
                user.setStudentProfile(student);
                studentRepository.save(student);
                logger.info("Kreiran novi student: {}", student.getUser().getName());
            }
            case PROFESOR -> {
                Tutor tutor = new Tutor();
                tutor.setUser(user);
                user.setTutorProfile(tutor);
                tutorRepository.save(tutor);
                logger.info("Kreiran novi profesor: {}", tutor.getUser().getName());
            }
            case OBOJE -> {
                Student student = new Student();
                student.setUser(user);
                Tutor tutor = new Tutor();
                tutor.setUser(user);
                studentRepository.save(student);
                tutorRepository.save(tutor);
                user.setStudentProfile(student);
                user.setTutorProfile(tutor);
                logger.info("Kreiran novi korisnik sa oba profila: {}", user.getUsername());
            }
            default -> logger.info("Kreiran novi korisnik bez student/tutor profila: {}", user.getUsername());
        }
        return ResponseEntity.ok().body("Racun kreiran");

    }
    @GetMapping("/welcomePage")
    public ResponseEntity<?> welcomePage(HttpServletRequest request)
    {
        String token=jwtUtil.extractJwtFromCookie(request);
        if(token != null && jwtUtil.validateToken(token))
        {
            String username= jwtUtil.getUsernameFromToken(token);
            return ResponseEntity.status(HttpStatus.OK).body(userService.getUserInfo(username));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("NEISPRAVAN TOKEN");
        }
    }

    private Set<AccountType> resolveInitialRoles(AccountType accountType) {
        return switch (accountType) {
            case OBOJE -> Set.of(AccountType.STUDENT, AccountType.PROFESOR);
            case STUDENT -> Set.of(AccountType.STUDENT);
            case PROFESOR -> Set.of(AccountType.PROFESOR);
            case ADMIN -> Set.of(AccountType.ADMIN);
            case KORISNIK -> Set.of(AccountType.KORISNIK);
        };
    }

    private String validateCreateAccountPayload(CreateAccountDTO dto) {
        if (dto == null) {
            return "Neispravan zahtjev.";
        }
        String username = dto.getUsername() == null ? null : dto.getUsername().trim();
        if (isBlank(username) || username.length() < 4 || username.length() > MAX_USERNAME_LENGTH) {
            return "Korisnicko ime mora imati najmanje 4 znaka.";
        }
        if (isBlank(dto.getPassword()) || dto.getPassword().length() < 8 || dto.getPassword().length() > MAX_PASSWORD_LENGTH) {
            return "Lozinka mora imati najmanje 8 znakova.";
        }
        String name = dto.getName() == null ? null : dto.getName().trim();
        if (isBlank(name) || name.length() < 2 || name.length() > MAX_NAME_LENGTH) {
            return "Ime je obavezno.";
        }
        String surname = dto.getSurname() == null ? null : dto.getSurname().trim();
        if (isBlank(surname) || surname.length() < 2 || surname.length() > MAX_SURNAME_LENGTH) {
            return "Prezime je obavezno.";
        }
        String email = dto.getEmail() == null ? null : dto.getEmail().trim();
        if (isBlank(email) || email.length() > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.matcher(email).matches()) {
            return "Email adresa nije validna.";
        }
        String phoneNumber = normalizePhone(dto.getPhoneNumber());
        if (phoneNumber.length() > MAX_PHONE_LENGTH) {
            return "Broj telefona nije validan.";
        }
        if (!isBlank(phoneNumber) && !PHONE_PATTERN.matcher(phoneNumber).matches()) {
            return "Broj telefona nije validan.";
        }
        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.trim();
    }


}
