package com.example.tutoring.Repositories;

import com.example.tutoring.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

//java persistence repository
public interface UserRepository extends JpaRepository<User,Long>
{
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByUsernameIgnoreCase(String username);
    Integer getIdByUsername(String username);

}
