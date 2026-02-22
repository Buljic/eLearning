package com.example.tutoring.Security;

import com.example.tutoring.Entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private static final String ACCESS_TOKEN_TYPE = "access";
    private static final String REFRESH_TOKEN_TYPE = "refresh";

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    @Value("${security.jwt.refresh-secret:${security.jwt.secret}}")
    private String jwtRefreshSecret;

    @Value("${security.jwt.expiration-ms:7200000}")
    private long jwtExpirationMs;

    @Value("${security.jwt.refresh-expiration-ms:2592000000}")
    private long refreshExpirationMs;

    private SecretKey accessSecretKey;
    private SecretKey refreshSecretKey;

    @PostConstruct
    public void initSecretKey() {
        this.accessSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.refreshSecretKey = Keys.hmacShaKeyFor(jwtRefreshSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        return generateAccessToken(user);
    }

    public String generateAccessToken(User user) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date exp = new Date(nowMillis + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("username", user.getUsername())
                .claim("role", user.getAccountType().toString())
                .claim("typ", ACCESS_TOKEN_TYPE)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(accessSecretKey)
                .compact();
    }

    public String generateRefreshToken(User user) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date exp = new Date(nowMillis + refreshExpirationMs);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("username", user.getUsername())
                .claim("typ", REFRESH_TOKEN_TYPE)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(refreshSecretKey)
                .compact();
    }

    public boolean validateToken(String token) {
        return validateAccessToken(token);
    }

    public boolean validateAccessToken(String token) {
        return validateTypedToken(token, accessSecretKey, ACCESS_TOKEN_TYPE);
    }

    public boolean validateRefreshToken(String token) {
        return validateTypedToken(token, refreshSecretKey, REFRESH_TOKEN_TYPE);
    }

    private boolean validateTypedToken(String token, SecretKey key, String expectedType) {
        try {
            Jws<Claims> claims = Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            String tokenType = claims.getBody().get("typ", String.class);
            return expectedType.equals(tokenType);
        } catch (Exception e) {
            return false;
        }
    }

    public String extractJwtFromCookie(HttpServletRequest request) {
        String accessToken = extractTokenFromCookie(request, "JWT");
        if (accessToken != null) {
            return accessToken;
        }
        return extractTokenFromCookie(request, "ACCESS_TOKEN");
    }

    public String extractRefreshJwtFromCookie(HttpServletRequest request) {
        String refreshToken = extractTokenFromCookie(request, "JWT_REFRESH");
        if (refreshToken != null) {
            return refreshToken;
        }
        return extractTokenFromCookie(request, "REFRESH_TOKEN");
    }

    private String extractTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public String getUsernameFromToken(String token) {
        return parseAccessClaims(token).getBody().get("username", String.class);
    }

    public String getRoleFromToken(String token) {
        return parseAccessClaims(token).getBody().get("role", String.class);
    }

    public String getUsernameFromRefreshToken(String token) {
        Jws<Claims> claimsJws = Jwts.parser()
                .setSigningKey(refreshSecretKey)
                .build()
                .parseClaimsJws(token);
        return claimsJws.getBody().get("username", String.class);
    }

    public long getAccessTokenExpirationMs() {
        return jwtExpirationMs;
    }

    public long getRefreshTokenExpirationMs() {
        return refreshExpirationMs;
    }

    private Jws<Claims> parseAccessClaims(String token) {
        return Jwts.parser()
                .setSigningKey(accessSecretKey)
                .build()
                .parseClaimsJws(token);
    }
}
