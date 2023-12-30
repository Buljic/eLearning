package ba.unze.elearning.tutoring.Entities;

import ba.unze.elearning.tutoring.Entities.Embeddeds.TutorSubjectRequestId;
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

//    @MapsId("requestDate")    //NE STAVLJA SE
//    private LocalDate requestDate;
}
