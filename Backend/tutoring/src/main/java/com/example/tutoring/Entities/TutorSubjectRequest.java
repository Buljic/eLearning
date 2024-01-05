package com.example.tutoring.Entities;

import com.example.tutoring.Entities.Embeddeds.TutorSubjectRequestId;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "tutorsubjectrequest")
public class TutorSubjectRequest
{
    @EmbeddedId
    private TutorSubjectRequestId id;

    @ManyToOne
    @JoinColumn(name = "tutor_id")
    @MapsId("tutorId")
    private Tutor tutor;//vise recorda mogu imati ovaj field

    @ManyToOne
    @JoinColumn(name = "subject_id")
    @MapsId("subjectId")
    private Subject subject;

    private String comment;
    private String writtenQualification;

    public String getWrittenQualification()
    {
        return writtenQualification;
    }

    public void setWrittenQualification(String writtenQualification)
    {
        this.writtenQualification = writtenQualification;
    }

    public TutorSubjectRequestId getId()
    {
        return id;
    }

    public void setId(TutorSubjectRequestId id)
    {
        this.id = id;
    }

    public String getComment()
    {
        return comment;
    }

    public void setComment(String comment)
    {
        this.comment = comment;
    }

    //    @MapsId("requestDate")    //NE STAVLJA SE
//    private LocalDate requestDate;
}
