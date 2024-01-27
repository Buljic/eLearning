package com.example.tutoring.Repositories;

import com.example.tutoring.Entities.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DirectMessageRepository extends JpaRepository<DirectMessage,Long>
{
}
