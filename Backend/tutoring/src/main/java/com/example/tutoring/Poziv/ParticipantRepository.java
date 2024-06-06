package com.example.tutoring.Poziv;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParticipantRepository extends JpaRepository<Participant, Long>
{
    List<Participant> findByVideoCall(VideoCall videoCall);
}
