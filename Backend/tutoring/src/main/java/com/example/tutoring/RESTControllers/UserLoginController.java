package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.LoginDetailsDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserLoginController
{
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDetailsDTO loginDetailsDTO)
    {
        //TODO operacija da se provjeri postojanje usernamea i provjera passworda njegovog
        return null;
    }
    @PostMapping("createAccount")//request body uzima json npr koji je poslan s requestom
    public ResponseEntity<?> createAccount(@RequestBody )

}
