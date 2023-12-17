package ba.unze.elearning.tutoring.Repositories;

import ba.unze.elearning.tutoring.Entities.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface TutorRepository extends JpaRepository<Tutor,Long>
{
}
