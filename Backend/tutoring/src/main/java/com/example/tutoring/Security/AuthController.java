package com.example.tutoring.Security;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Repositories.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
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
    public AuthController(JwtUtil jwtUtil,UserRepository userRepository){
        this.jwtUtil=jwtUtil;
        this.userRepository=userRepository;
    }
    @PostMapping ("/login") //mozes fakticki koristiti bilo koju klasu koja odgovara json formatu koji se salje
    public ResponseEntity<?> autentificarKorisnika(@RequestBody LoginRequest loginRequest){//(@RequestParam String username,@RequestParam String password){

        if(userRepository.existsByUsername(loginRequest.getUsername()))
        {
            Optional<User> user=userRepository.findByUsername(loginRequest.getUsername());
            if(loginRequest.getPassword().equals(user.get().getPassword()))//mozda da se provjeri ispresent ali i ne mora
            {
                String token=jwtUtil.generateToken(loginRequest.getUsername());

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
//        if("testIme".equals(loginRequest.getUsername()) && "testPassword".equals(loginRequest.getPassword()))
//        {
//            String token=jwtUtil.generateToken(loginRequest.getUsername());
//            return ResponseEntity.ok(new JwtResponse(token));//lakse poslije dodavati jos info , npr vrijeme isteka toke
//            //-na i slicno , umjesto da samo string proslijedjujemo mada je i to moguce
//        }
//        else return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Neispravni kredencijali");
    }
}
//TODO koristi ovaj kontroler za loginovanje
