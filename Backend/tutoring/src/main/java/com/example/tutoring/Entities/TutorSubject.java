package com.example.tutoring.Entities;

import com.example.tutoring.Entities.Embeddeds.TutorSubjectId;
import jakarta.persistence.*;

@Entity
@Table(name="tutorsubject")
public class TutorSubject
{
//    @Id
//    @GeneratedValue(strategy= GenerationType.IDENTITY)
//    private Long id;

    @EmbeddedId
    private TutorSubjectId id;

    @ManyToOne
    @MapsId("tutor")
    @JoinColumn(name="tutor_id")
    private Tutor tutor;

    @ManyToOne
    @MapsId("subject")
    @JoinColumn(name="subject_id")
    private Subject subject;

    //private int grade;
}
