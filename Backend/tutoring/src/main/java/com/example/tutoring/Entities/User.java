package com.example.tutoring.Entities;

import jakarta.persistence.*;

@Entity
@Inheritance(strategy=InheritanceType.JOINED)//da su razliciti svi entiteti ali povezani s glavnim sa 1 na 1
public class User
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String name;
    private String surname;
    private String email;

    public Long getId()
    {
        return id;
    }
    public String getUsername()
    {
        return username;
    }

    public void setUsername(String username)
    {
        this.username = username;
    }
    User(){

    }

    public User(String username, String name, String surname, String email)
    {
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.email = email;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getSurname()
    {
        return surname;
    }

    public void setSurname(String surname)
    {
        this.surname = surname;
    }

    public String getEmail()
    {
        return email;
    }

    public void setEmail(String email)
    {
        this.email = email;
    }
}
