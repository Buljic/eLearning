package com.example.tutoring.Security;

//Standardna DTO klasa tj Data Transfer Object
//Ona je model koji ce drzati JWT i biti poslan kao
//odgovor kada korisnik izvrsi prijavu
public class JwtResponse
{
    private String token;
    public JwtResponse(String token)
    {
        this.token=token;
    }

    public void setToken(String token)
    {
        this.token = token;
    }
    public String getToken()
    {
        return this.token;
    }
}
