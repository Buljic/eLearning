package com.example.tutoring.Entities;

import com.example.tutoring.Other.AccountType;
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
    private String password;
    private String phoneNumber;
    @OneToOne(mappedBy = "user")//mappedBy se koristi da se zna ko posjeduje stvarni kljuc
    private Student studentProfile;
    @OneToOne(mappedBy="user")//odnosi se na ime atributa unutar respektivne klase koja 'pointa' nad ovu nadklasu sa onetooneanotacijom
    private Tutor tutorProfile;//koristi se ime java klase

    @Enumerated(EnumType.STRING)
    private AccountType accountType;



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
    public User(){

    }

    public User(String username,String password, String name, String surname, String email,String phoneNumber, AccountType accountType)
    {
        this.username = username;
        this.password=password;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phoneNumber=phoneNumber;
        this.accountType=accountType;
    }

    public Student getStudentProfile()
    {
        return studentProfile;
    }

    public void setStudentProfile(Student studentProfile)
    {
        this.studentProfile = studentProfile;
    }

    public Tutor getTutorProfile()
    {
        return tutorProfile;
    }

    public void setTutorProfile(Tutor tutorProfile)
    {
        this.tutorProfile = tutorProfile;
    }

    public String getPassword()
    {
        return password;
    }

    public void setPassword(String password)
    {
        this.password = password;
    }

    public String getPhoneNumber()
    {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber)
    {
        this.phoneNumber = phoneNumber;
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

    public AccountType getAccountType()
    {
        return accountType;
    }

    public void setAccountType(AccountType accountType)
    {
        this.accountType = accountType;
    }
}
