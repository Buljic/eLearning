package com.example.tutoring.Entities;

import jakarta.persistence.*;

@Entity
public class TutorSubject
{
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="tutor_id")
    private Tutor tutor;

    @ManyToOne
    @JoinColumn(name="subject_id")
    private Subject subject;

    //private int grade;
}
