package com.example.tutoring.Security;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AuthController {
    @Value("${security.jwt.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${security.jwt.cookie-same-site:Lax}")
    private String cookieSameSite;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public AuthController(JwtUtil jwtUtil, UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> autentificarKorisnika(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nepostojeci user");
        }

        User user = userOptional.get();
        if (!bCryptPasswordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Neispravni kredencijali");
        }

        return buildAuthenticatedResponse(user, "Autentifikacija uspjesna");
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String refreshToken = jwtUtil.extractRefreshJwtFromCookie(request);
        if (refreshToken == null || !jwtUtil.validateRefreshToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid refresh token");
        }

        String username = jwtUtil.getUsernameFromRefreshToken(refreshToken);
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unknown refresh token subject");
        }

        return buildAuthenticatedResponse(userOptional.get(), "Token refreshed");
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie accessCookie = buildAccessCookie("", 0);
        ResponseCookie refreshCookie = buildRefreshCookie("", 0);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body("Logged out");
    }

    private ResponseEntity<String> buildAuthenticatedResponse(User user, String message) {
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        ResponseCookie accessCookie = buildAccessCookie(accessToken, jwtUtil.getAccessTokenExpirationMs());
        ResponseCookie refreshCookie = buildRefreshCookie(refreshToken, jwtUtil.getRefreshTokenExpirationMs());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(message);
    }

    private ResponseCookie buildAccessCookie(String value, long maxAgeMs) {
        return ResponseCookie.from("JWT", value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite)
                .maxAge(Duration.ofMillis(maxAgeMs))
                .build();
    }

    private ResponseCookie buildRefreshCookie(String value, long maxAgeMs) {
        return ResponseCookie.from("JWT_REFRESH", value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite)
                .maxAge(Duration.ofMillis(maxAgeMs))
                .build();
    }
}
