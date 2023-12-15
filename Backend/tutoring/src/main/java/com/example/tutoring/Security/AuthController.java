package com.example.tutoring.Security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController
{
    private final JwtUtil jwtUtil;
    public AuthController(JwtUtil jwtUtil){
        this.jwtUtil=jwtUtil;
    }
    @PostMapping ("/login") //mozes fakticki koristiti bilo koju klasu koja odgovara json formatu koji se salje
    public ResponseEntity<?> autentificarKorisnika(@RequestBody LoginRequest loginRequest){//(@RequestParam String username,@RequestParam String password){
        if("testIme".equals(loginRequest.getUsername()) && "testPassword".equals(loginRequest.getPassword()))
        {
            String token=jwtUtil.generateToken(loginRequest.getUsername());
            return ResponseEntity.ok(new JwtResponse(token));//lakse poslije dodavati jos info , npr vrijeme isteka toke
            //-na i slicno , umjesto da samo string proslijedjujemo mada je i to moguce
        }
        else return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Neispravni kredencijali");
    }
}
