package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.CreateAccountDTO;
import com.example.tutoring.Entities.Student;
import com.example.tutoring.Entities.Tutor;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Repositories.StudentRepository;
import com.example.tutoring.Repositories.TutorRepository;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserLoginController
{
    private final UserRepository userRepository;
    private final TutorRepository tutorRepository;
    private final StudentRepository studentRepository;
    private final UserService userService;

    private final JwtUtil jwtUtil;

    UserLoginController(UserRepository userRepository, TutorRepository tutorRepository,
                        StudentRepository studentRepository, UserService userService, JwtUtil jwtUtil)

    {
        this.userRepository=userRepository;
        this.tutorRepository = tutorRepository;
        this.studentRepository = studentRepository;
        this.userService = userService;
        this.jwtUtil=jwtUtil;
    }

//    @PostMapping("/login")
//    public ResponseEntity<?> login(@RequestBody LoginDetailsDTO loginDetailsDTO)
//    {
//        //TODO operacija da se provjeri postojanje usernamea i provjera passworda njegovog
//        return null;
//    }
    @PostMapping("/createAccount")//request body uzima json npr koji je poslan s requestom
    public ResponseEntity<?> createAccount(@RequestBody CreateAccountDTO createAccountDTO)
    {//na osnovu odredjenog enuma , ovisi kakav account kreiras
        if(userRepository.existsByUsername(createAccountDTO.getUsername()))
        {
          return  ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Korisnicko ime vec postoji");
        }
        User user=new User(createAccountDTO.getUsername(),createAccountDTO.getPassword()
        ,createAccountDTO.getName(),
                createAccountDTO.getSurname(),
                createAccountDTO.getEmail(),
                createAccountDTO.getPhoneNumber(),
                createAccountDTO.getAccountType());
        userRepository.save(user);
        if(createAccountDTO.getAccountType()== AccountType.STUDENT)
        {
            Student student=new Student();
            student.setUser(user);
            user.setStudentProfile(student);
            studentRepository.save(student);
            System.out.println("Kreiran novi student:" +student.getUser().getName());
        }else if(createAccountDTO.getAccountType()==AccountType.PROFESOR)
        {
            Tutor tutor=new Tutor();
            tutor.setUser(user);
            user.setTutorProfile(tutor);
            tutorRepository.save(tutor);
            System.out.println("Kreiran novi profesor:" + tutor.getUser().getName() );
        }else if(createAccountDTO.getAccountType()==AccountType.KORISNIK)
        {

        }
        else {
            Student student=new Student();
            student.setUser(user);
            Tutor tutor=new Tutor();
            tutor.setUser(user);
            studentRepository.save(student);
            tutorRepository.save(tutor);
            user.setStudentProfile(student);
            user.setTutorProfile(tutor);
        }
        return ResponseEntity.ok().body("Racun kreiran");

    }
    @GetMapping("/welcomePage")
    public ResponseEntity<?> welcomePage(HttpServletRequest request)
    {
        String token=jwtUtil.extractJwtFromCookie(request);
        if(token!=null)
        {
            System.out.println("ok obradjuje ga bar");
            String username= jwtUtil.getUsernameFromToken(token);
            //return ResponseEntity.status(HttpStatus.OK).body(username);
            return ResponseEntity.status(HttpStatus.OK).body(userService.getUserInfo(username));
        }else return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("NEISPRAVNO");

    }


}
