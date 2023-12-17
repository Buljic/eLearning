package com.example.tutoring.DTOs;

import com.example.tutoring.Other.AccountType;

public class CreateAccountDTO
{
    private String username;
    private String name;
    private String surname;
    private String email;
    private String phoneNumber;
    private String password;
    private AccountType accountType;

    public String getUsername()
    {
        return username;
    }

    public String getName()
    {
        return name;
    }

    public String getSurname()
    {
        return surname;
    }

    public String getEmail()
    {
        return email;
    }

    public String getPhoneNumber()
    {
        return phoneNumber;
    }

    public String getPassword()
    {
        return password;
    }

    public AccountType getAccountType()
    {
        return accountType;
    }
}
