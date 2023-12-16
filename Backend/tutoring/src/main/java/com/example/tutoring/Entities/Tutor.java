package com.example.tutoring.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Tutor extends User
{
    //koristi kasnije super() za konstruktor nadklase
    @ManyToMany
//    @JoinTable(
//            name = "tutor_subject",
//            joinColumns = @JoinColumn(name = "tutor_id"),
//            inverseJoinColumns = @JoinColumn(name = "subject_id")
//    ) moze i s ovim ali nam treba nova klasa radi ostalih atributa
    private Set<Subject> subjects=new HashSet<>();


}
