package com.example.tutoring.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtFilter extends GenericFilterBean
{
    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException
    {

        HttpServletRequest httpRequest = (HttpServletRequest)request;
        String requestURI = httpRequest.getRequestURI();
        System.out.println("Processing request for: " + requestURI); // Dodaj ovo za logovanje

        //Ovdje navodis sve endpointe koje ce jwt filter ignorirati tj sve one za koje frontend moze slati zahtjev a nije potrebna
        //registracija
        List<String> ignoredEndpointsBy = Arrays.asList("/api/login", "/api/createAccount", "/");

        // Preskacete provjeru JWT-a za login endpoint
        if (ignoredEndpointsBy.contains(requestURI))
        {  //TODO IGNORE NAPRAVI
            chain.doFilter(request, response);
            return;
        }
        else
        {

            String token = httpRequest.getHeader("Authorization"); //da skine header s api calla

            if (token != null && jwtUtil.validateToken(token))
            {
                // Ako je JWT valjan, nastavite s lancem filtera
                chain.doFilter(request, response);
            }
            else
            {
                throw new ServletException("Neispravan ili nedostajuci JWT");
            }
        }
    }
}

