package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.CreateAccountDTO;
import com.example.tutoring.DTOs.LoginDetailsDTO;
import com.example.tutoring.Entities.Student;
import com.example.tutoring.Entities.Tutor;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserLoginController
{
    private final UserRepository userRepository;

    UserLoginController(UserRepository userRepository)
    {
        this.userRepository=userRepository;
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDetailsDTO loginDetailsDTO)
    {
        //TODO operacija da se provjeri postojanje usernamea i provjera passworda njegovog
        return null;
    }
    @PostMapping("createAccount")//request body uzima json npr koji je poslan s requestom
    public ResponseEntity<?> createAccount(@RequestBody CreateAccountDTO createAccountDTO)
    {//na osnovu odredjenog enuma , ovisi kakav account kreiras
        User user=new User(createAccountDTO.getUsername(),createAccountDTO.getPassword()
        ,createAccountDTO.getName(),
                createAccountDTO.getSurname(),
                createAccountDTO.getEmail(),
                createAccountDTO.getPhoneNumber());
        userRepository.save(user);
        if(createAccountDTO.getAccountType()== AccountType.STUDENT)
        {
            Student student=new Student();

            student.setUser(user);
            user.setStudentProfile(student);
        }else if(createAccountDTO.getAccountType()==AccountType.PROFESOR)
        {
            Tutor tutor=new Tutor();
            tutor.setUser(user);
            user.setTutorProfile(tutor);
        }else if(createAccountDTO.getAccountType()==AccountType.KORISNIK)
        {

        }
        else {
            Student student=new Student();
            student.setUser(user);
            Tutor tutor=new Tutor();
            tutor.setUser(user);
            user.setStudentProfile(student);
            user.setTutorProfile(tutor);
        }
        return ResponseEntity.ok().body("Racun kreiran");

    }

}
