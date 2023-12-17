package com.example.tutoring.Repositories;

import com.example.tutoring.Entities.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface TutorRepository extends JpaRepository<Tutor,Long>
{
}
