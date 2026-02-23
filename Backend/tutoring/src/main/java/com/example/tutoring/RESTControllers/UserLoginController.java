package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.CreateAccountDTO;
import com.example.tutoring.Entities.Student;
import com.example.tutoring.Entities.Tutor;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Repositories.StudentRepository;
import com.example.tutoring.Repositories.TutorRepository;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Security.EncriptionUtility;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class UserLoginController
{
    private static final Logger logger = LoggerFactory.getLogger(UserLoginController.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[0-9+\\-\\s]{6,20}$");
    private final UserRepository userRepository;
    private final TutorRepository tutorRepository;
    private final StudentRepository studentRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final EncriptionUtility encriptionUtility;

    UserLoginController(UserRepository userRepository, TutorRepository tutorRepository,
                        StudentRepository studentRepository, UserService userService, JwtUtil jwtUtil,
                        BCryptPasswordEncoder bCryptPasswordEncoder, EncriptionUtility encriptionUtility)

    {
        this.userRepository=userRepository;
        this.tutorRepository = tutorRepository;
        this.studentRepository = studentRepository;
        this.userService = userService;
        this.jwtUtil=jwtUtil;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.encriptionUtility = encriptionUtility;
    }


    @PostMapping("/createAccount")//request body uzima json npr koji je poslan s requestom
    public ResponseEntity<?> createAccount(@RequestBody CreateAccountDTO createAccountDTO)
    {//na osnovu odredjenog enuma , ovisi kakav account kreiras
        String validationError = validateCreateAccountPayload(createAccountDTO);
        if (validationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(validationError);
        }

        if (createAccountDTO.getAccountType() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tip naloga je obavezan");
        }
        if(userRepository.existsByUsername(createAccountDTO.getUsername()))
        {
          return  ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Korisnicko ime vec postoji");
        }
        User user=new User(createAccountDTO.getUsername(),bCryptPasswordEncoder.encode(createAccountDTO.getPassword())
        ,createAccountDTO.getName(),
                createAccountDTO.getSurname(),
                encriptionUtility.encrypt(createAccountDTO.getEmail()),
                encriptionUtility.encrypt(createAccountDTO.getPhoneNumber()),
                createAccountDTO.getAccountType());
        user.setRoles(resolveInitialRoles(createAccountDTO.getAccountType()));
        userRepository.save(user);
        switch (createAccountDTO.getAccountType()) {
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
        if (isBlank(dto.getUsername()) || dto.getUsername().length() < 4) {
            return "Korisnicko ime mora imati najmanje 4 znaka.";
        }
        if (isBlank(dto.getPassword()) || dto.getPassword().length() < 8) {
            return "Lozinka mora imati najmanje 8 znakova.";
        }
        if (isBlank(dto.getName()) || dto.getName().length() < 2) {
            return "Ime je obavezno.";
        }
        if (isBlank(dto.getSurname()) || dto.getSurname().length() < 2) {
            return "Prezime je obavezno.";
        }
        if (isBlank(dto.getEmail()) || !EMAIL_PATTERN.matcher(dto.getEmail()).matches()) {
            return "Email adresa nije validna.";
        }
        if (!isBlank(dto.getPhoneNumber()) && !PHONE_PATTERN.matcher(dto.getPhoneNumber()).matches()) {
            return "Broj telefona nije validan.";
        }
        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }


}
