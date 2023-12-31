package com.example.tutoring.Entities;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Tutor //extends User
{
    //TODO odluci se za naslijedjivanje ili onetoone ne oboje
    @Id
    private Long id;
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    //koristi kasnije super() za konstruktor nadklase
    @ManyToMany
    @JoinTable(
            name = "tutorsubject",
            joinColumns = @JoinColumn(name = "tutor_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )// moze i s ovim ali nam treba nova klasa radi ostalih atributa
    private Set<Subject> subjects=new HashSet<>();



    @OneToMany(mappedBy = "tutor")
    private Set<TutorSubjectRequest> subjectRequests=new HashSet<>();

    public Set<Subject> getSubjects()
    {
        return subjects;
    }

    public void setSubjects(Set<Subject> subjects)
    {
        this.subjects = subjects;
    }

    public User getUser()
    {
        return user;
    }

    public void setUser(User user)
    {
        this.user = user;
    }
}
