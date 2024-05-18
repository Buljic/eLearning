package com.example.tutoring.Security;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Repositories.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AuthController
{
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    public AuthController(JwtUtil jwtUtil, UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder){
        this.jwtUtil=jwtUtil;
        this.userRepository=userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }
    @PostMapping ("/login") //mozes fakticki koristiti bilo koju klasu koja odgovara json formatu koji se salje
    public ResponseEntity<?> autentificarKorisnika(@RequestBody LoginRequest loginRequest){//(@RequestParam String username,@RequestParam String password){

        if(userRepository.existsByUsername(loginRequest.getUsername()))
        {
            Optional<User> user=userRepository.findByUsername(loginRequest.getUsername());
            if(bCryptPasswordEncoder.matches(loginRequest.getPassword(),user.get().getPassword()))//loginRequest.getPassword().equals(user.get().getPassword()))//mozda da se provjeri ispresent ali i ne mora
            {
                String token=jwtUtil.generateToken(user);

                //Kreiranje Http Cookie sa JWT tokenom
                ResponseCookie jwtCookie=ResponseCookie.from("JWT",token)
                        .httpOnly(true)//da se ne dozvoli pristup klijentskom javascriptu radi xss i slicno
                       // .secure(true)//samo za https stranice TODO podesi https stranicu
                        .path("/")//da je dostupan unutar cijele aplikacije
                        .build();
                System.out.println("Poslano");
                return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                        .body("Autentifikacija  uspjesna");

            }else
            {   System.out.println("Neispravni kredencijali");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Neispravni kredencijali");
            }
        }else {
            System.out.println("Nepostojuci user");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nepostojuci user");
        }

    }
}