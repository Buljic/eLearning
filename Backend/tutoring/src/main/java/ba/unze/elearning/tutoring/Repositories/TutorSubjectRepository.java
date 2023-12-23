package ba.unze.elearning.tutoring.Repositories;

import ba.unze.elearning.tutoring.DTOs.StringNumber;
import ba.unze.elearning.tutoring.Entities.TutorSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface TutorSubjectRepository extends JpaRepository<TutorSubject,Long>
{
//    @Query("SELECT Subject.subject_name, COUNT(TutorSubject.tutor) as brojtutora from TutorSubject JOIN Subject ON " +
//            "TutorSubject.subject=Subject.id GROUP BY Subject.subject_name order by brojtutora limit 5")
//    List<StringNumber> mostTutorSubjects();
}
