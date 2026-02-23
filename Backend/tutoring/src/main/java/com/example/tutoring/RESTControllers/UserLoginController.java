package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.CreateAccountDTO;
import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.DTOs.UserDTO;
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

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserLoginController
{
    private static final Logger logger = LoggerFactory.getLogger(UserLoginController.class);
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


}
