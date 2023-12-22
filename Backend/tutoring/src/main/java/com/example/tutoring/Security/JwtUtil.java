package com.example.tutoring.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

//Znaci fakticki ova klasa tj bean se koristi za najbitniju logiku tj kreiranje
//i verifikaciju samog jwta a ona sama po sebi nikako ne djeluje vec koristimo ovu klasu
//da pozivamo njene metode i kreiramo te kljuceve i verfikujemo iste
@Component
public class JwtUtil
{
    private SecretKey secretKey= Keys.secretKeyFor(SignatureAlgorithm.HS512);//generira secret key

    public String generateToken(String username)
    {
        long nowMillis=System.currentTimeMillis();
        Date now=new Date(nowMillis);
        long expMillis=nowMillis+3600000;//da token istekne za sat
        Date exp=new Date(expMillis);

        return Jwts.builder()//jwts je klasa a builder staticka metoda koja vraca JwtsBuilder objekat
                .setSubject(username)
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
            System.out.println("Greska u"+ e);
            return false;
        }
    }

    public String extractJwtFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ((cookie.getName()).contains("JWT") ) {
                    System.out.println("Naslo ga je  TJ COOKIEA");
                    return cookie.getValue();
                }
            }
        }
        System.out.println("NIJE GA NASLO");
        return null;
    }

    public String getUsernameFromToken(String token)
    {
        Jws<Claims> claimsJws=Jwts.parser().setSigningKey(secretKey).build().parseClaimsJws(token);
        return claimsJws.getBody().getSubject();
    }

}
