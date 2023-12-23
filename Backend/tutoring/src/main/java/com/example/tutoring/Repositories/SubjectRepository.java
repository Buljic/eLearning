package com.example.tutoring.Repositories;

import com.example.tutoring.Entities.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject,Long>
{
    //mozes koristiti bilo koje ime cak i kljucne rijeci
    @Query("SELECT subject_name FROM Subject")
    List<String> findAllSubjects();



}
