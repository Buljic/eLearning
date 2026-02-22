package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Embeddable
public class TutorSubjectRequestId implements Serializable
{
    private Long tutorId;
    private Long subjectId;
    private LocalDate  requestDate;

    public TutorSubjectRequestId() {
    }

    public TutorSubjectRequestId(Long tutorId, Long subjectId, LocalDate requestDate) {
        this.tutorId = tutorId;
        this.subjectId = subjectId;
        this.requestDate = requestDate;
    }

    public Long getTutorId() {
        return tutorId;
    }

    public void setTutorId(Long tutorId) {
        this.tutorId = tutorId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (!(o instanceof TutorSubjectRequestId that)) return false;
        return Objects.equals(tutorId, that.tutorId)
                && Objects.equals(subjectId, that.subjectId)
                && Objects.equals(requestDate, that.requestDate);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(tutorId, subjectId, requestDate);
    }
}
