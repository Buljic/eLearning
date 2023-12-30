package com.example.tutoring.Entities.Embeddeds;

import com.example.tutoring.Entities.Subject;
import com.example.tutoring.Entities.Tutor;
import jakarta.persistence.Embeddable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.io.Serializable;

@Embeddable
public class TutorSubjectId implements Serializable
{
    private Long tutor;

    private Long subject;

    public Long getTutor()
    {
        return tutor;
    }

    public void setTutor(Long tutor)
    {
        this.tutor = tutor;
    }

    public Long getSubject()
    {
        return subject;
    }

    public void setSubject(Long subject)
    {
        this.subject = subject;
    }
}
