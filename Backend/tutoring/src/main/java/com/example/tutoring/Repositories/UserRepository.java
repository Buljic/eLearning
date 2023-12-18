package com.example.tutoring.Repositories;

import com.example.tutoring.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

//java persistence repository
public interface UserRepository extends JpaRepository<User,Long>
{
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
