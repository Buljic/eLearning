package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

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

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (!(o instanceof TutorSubjectId that)) return false;
        return Objects.equals(tutor, that.tutor)
                && Objects.equals(subject, that.subject);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(tutor, subject);
    }
}
