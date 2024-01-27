package ba.unze.elearning.tutoring.Repositories;

import ba.unze.elearning.tutoring.Entities.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DirectMessageRepository extends JpaRepository<DirectMessage,Long>
{
}
