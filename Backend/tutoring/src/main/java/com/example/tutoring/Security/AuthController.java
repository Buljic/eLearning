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
    private static final String ACCESS_COOKIE_PATH = "/";
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

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
        if (loginRequest == null
                || loginRequest.getUsername() == null
                || loginRequest.getPassword() == null
                || loginRequest.getUsername().isBlank()
                || loginRequest.getPassword().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Neispravni kredencijali");
        }

        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        if (userOptional.isEmpty()
                || !bCryptPasswordEncoder.matches(loginRequest.getPassword(), userOptional.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Neispravni kredencijali");
        }

        User user = userOptional.get();
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
        ResponseCookie legacyRefreshCookie = buildRefreshCookieForPath("", 0, "/");

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .header(HttpHeaders.SET_COOKIE, legacyRefreshCookie.toString())
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
        return buildCookieForPath("JWT", value, maxAgeMs, ACCESS_COOKIE_PATH);
    }

    private ResponseCookie buildRefreshCookie(String value, long maxAgeMs) {
        return buildRefreshCookieForPath(value, maxAgeMs, REFRESH_COOKIE_PATH);
    }

    private ResponseCookie buildRefreshCookieForPath(String value, long maxAgeMs, String path) {
        return buildCookieForPath("JWT_REFRESH", value, maxAgeMs, path);
    }

    private ResponseCookie buildCookieForPath(String name, String value, long maxAgeMs, String path) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path(path)
                .sameSite(cookieSameSite)
                .maxAge(Duration.ofMillis(maxAgeMs))
                .build();
    }
}
