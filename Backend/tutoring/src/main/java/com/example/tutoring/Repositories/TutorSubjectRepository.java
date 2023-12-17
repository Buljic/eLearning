package com.example.tutoring.Repositories;

import com.example.tutoring.Entities.TutorSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface TutorSubjectRepository extends JpaRepository<TutorSubject,Long>
{
}
