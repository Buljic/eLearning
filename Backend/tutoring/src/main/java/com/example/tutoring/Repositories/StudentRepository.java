package com.example.tutoring.Repositories;

import com.example.tutoring.Entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface StudentRepository extends JpaRepository<Student,Long>
{ }
