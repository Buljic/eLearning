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

//Znaci fakticki ova klasa tj bean se koristi za najbitniju logiku tj kreiranje
//i verifikaciju samog jwta a ona sama po sebi nikako ne djeluje vec koristimo ovu klasu
//da pozivamo njene metode i kreiramo te kljuceve i verfikujemo iste
@Component
public class JwtUtil
{
    @Value("${security.jwt.secret}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:7200000}")
    private long jwtExpirationMs;

    private SecretKey secretKey;

    @PostConstruct
    public void initSecretKey() {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }


    public String generateToken(User user)
    {
        long nowMillis=System.currentTimeMillis();
        Date now=new Date(nowMillis);
        long expMillis=nowMillis+jwtExpirationMs;//da token istekne za 2 sata
        Date exp=new Date(expMillis);

        return Jwts.builder()//jwts je klasa a builder staticka metoda koja vraca JwtsBuilder objekat
                .setSubject(user.getUsername())
                .claim("username",user.getUsername())
                .claim("role",user.getAccountType().toString())
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(secretKey)
                .compact();//metoda koja se poziva nad onim jwtsbuilder objektom da sve ovo pretvori u string
        //ne sprema se ovaj kljuc na serveru jer je stateless veza
    }
    public boolean validateToken(String token)
    {
        try{
            //(JSON Web Signature)
            //claims u smislu izjave o korisniku tj identittu korisnika... tj kao payload reprezentacija
            Jws<Claims> claims=//json web signature //claims je za tvrdnje o korisnikua n
                    Jwts.parser()//parser cita tekstualne podatke i intrepertira ih, a ovdje analizira jwt string dekodira ga provjerava
                            //potpis i izvlaci info iz njega tj 'claims'
                            .setSigningKey(secretKey)
                            .build()
                            //vraca kao jwtparser koji ce biti koristen za dekodiranje i nad kojim pozivamo metodu
                            //koja proslijedi mu token nas
                            .parseClaimsJws(token);//vraca jwsclaims objekat
            return true;

        }
        catch (Exception e){
            return false;
        }
    }

    public String extractJwtFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("JWT".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public String getUsernameFromToken(String token)
    {
        Jws<Claims> claimsJws=Jwts.parser().
                setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token);
        return claimsJws.getBody().get("username",String.class);
    }
    public String getRoleFromToken(String token)
    {
        Jws<Claims> claimsJws=Jwts.parser().
                setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token);
        return claimsJws.getBody().get("role",String.class);
    }
}
