package com.example.tutoring.Repositories;

import com.example.tutoring.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;

//java persistence repository
public interface UserRepository extends JpaRepository<User,Long>
{

}
