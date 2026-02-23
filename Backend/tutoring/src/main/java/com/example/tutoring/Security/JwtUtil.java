package com.example.tutoring.Security;

import com.example.tutoring.Entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
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
        warnIfWeakSecret("access", jwtSecret);
        warnIfWeakSecret("refresh", jwtRefreshSecret);
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
        List<String> roles = resolveRolesForToken(user);
        String primaryRole = roles.isEmpty() ? "KORISNIK" : roles.get(0);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("username", user.getUsername())
                .claim("role", primaryRole)
                .claim("roles", roles)
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
        Set<String> roles = getRolesFromToken(token);
        if (!roles.isEmpty()) {
            return roles.stream().findFirst().orElse("KORISNIK");
        }
        return parseAccessClaims(token).getBody().get("role", String.class);
    }

    public Set<String> getRolesFromToken(String token) {
        Claims claims = parseAccessClaims(token).getBody();
        Set<String> roles = new HashSet<>();

        Object rawRoles = claims.get("roles");
        if (rawRoles instanceof Collection<?> collection) {
            for (Object rawRole : collection) {
                if (rawRole != null) {
                    roles.add(rawRole.toString());
                }
            }
        }

        String singleRole = claims.get("role", String.class);
        if (singleRole != null && !singleRole.isBlank()) {
            roles.add(singleRole);
        }

        if (roles.contains("OBOJE")) {
            roles.remove("OBOJE");
            roles.add("STUDENT");
            roles.add("PROFESOR");
        }

        return roles;
    }

    public boolean tokenHasAnyRole(String token, String... expectedRoles) {
        Set<String> roles = getRolesFromToken(token);
        for (String expectedRole : expectedRoles) {
            if (roles.contains(expectedRole)) {
                return true;
            }
        }
        return false;
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

    private List<String> resolveRolesForToken(User user) {
        Set<String> normalizedRoles = new HashSet<>();
        user.getEffectiveRoles().forEach(role -> normalizedRoles.add(role.name()));

        if (normalizedRoles.isEmpty()) {
            normalizedRoles.add("KORISNIK");
        }

        List<String> ordered = new ArrayList<>();
        if (normalizedRoles.contains("ADMIN")) {
            ordered.add("ADMIN");
        }
        if (normalizedRoles.contains("PROFESOR")) {
            ordered.add("PROFESOR");
        }
        if (normalizedRoles.contains("STUDENT")) {
            ordered.add("STUDENT");
        }
        if (normalizedRoles.contains("KORISNIK")) {
            ordered.add("KORISNIK");
        }

        for (String role : normalizedRoles) {
            if (!ordered.contains(role)) {
                ordered.add(role);
            }
        }

        return ordered;
    }

    private void warnIfWeakSecret(String tokenType, String configuredSecret) {
        if (configuredSecret == null || configuredSecret.length() < 32) {
            logger.warn("JWT {} secret is shorter than recommended minimum (32 chars).", tokenType);
            return;
        }
        if (configuredSecret.contains("change-me")) {
            logger.warn("JWT {} secret appears to use a default placeholder value. Configure a strong secret via environment variables.", tokenType);
        }
    }
}
