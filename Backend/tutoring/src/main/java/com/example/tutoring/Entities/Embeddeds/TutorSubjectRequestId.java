package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.time.LocalDate;

@Embeddable
public class TutorSubjectRequestId implements Serializable
{
    private Long tutorId;
    private Long subjectId;
    private LocalDate  requestDate;
}
