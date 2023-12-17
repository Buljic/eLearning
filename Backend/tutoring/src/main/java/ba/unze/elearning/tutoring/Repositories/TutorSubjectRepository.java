package ba.unze.elearning.tutoring.Repositories;

import ba.unze.elearning.tutoring.Entities.TutorSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface TutorSubjectRepository extends JpaRepository<TutorSubject,Long>
{
}
