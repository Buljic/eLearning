package ba.unze.elearning.tutoring.Entities;

import ba.unze.elearning.tutoring.Entities.Embeddeds.GroupSubjectId;
import jakarta.persistence.*;

@Entity
@Table(name = "group_subject")
public class GroupSubject {

    @EmbeddedId
    private GroupSubjectId groupSubjectId;

    @ManyToOne
    @MapsId("group")
    @JoinColumn(name = "group_id")
    private Group group;

    @ManyToOne
    @MapsId("subject")
    @JoinColumn(name = "subject_id")
    private Subject subject;

    public GroupSubjectId getGroupSubjectId()
    {
        return groupSubjectId;
    }
}

