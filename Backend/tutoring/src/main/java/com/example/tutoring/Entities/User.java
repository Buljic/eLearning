package com.example.tutoring.Entities;

import com.example.tutoring.Other.AccountType;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Set<AccountType> roles = new HashSet<>();

    public User(String username)
    {
        this.username=username;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

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

    public Set<AccountType> getRoles() {
        return roles;
    }

    public void setRoles(Set<AccountType> roles) {
        this.roles = roles == null ? new HashSet<>() : new HashSet<>(roles);
    }

    public Set<AccountType> getEffectiveRoles() {
        if (roles != null && !roles.isEmpty()) {
            return normalizeRoles(roles);
        }
        if (accountType == null) {
            return new HashSet<>();
        }
        return normalizeRoles(Set.of(accountType));
    }

    public boolean hasRole(AccountType role) {
        return getEffectiveRoles().contains(role);
    }

    public static Set<AccountType> normalizeRoles(Set<AccountType> inputRoles) {
        Set<AccountType> normalized = new HashSet<>();
        if (inputRoles == null) {
            return normalized;
        }

        for (AccountType role : inputRoles) {
            if (role == null) {
                continue;
            }
            if (role == AccountType.OBOJE) {
                normalized.add(AccountType.STUDENT);
                normalized.add(AccountType.PROFESOR);
            } else {
                normalized.add(role);
            }
        }
        return normalized;
    }
}
