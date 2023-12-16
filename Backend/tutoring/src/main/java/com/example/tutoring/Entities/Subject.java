package com.example.tutoring.Entities;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Subject
{
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Long id;

    private String subject_name;
    @ManyToMany(mappedBy="subjects")
    private Set<Tutor> tutors=new HashSet<>();//da osiguramo da nema ono nullptr exception

}
