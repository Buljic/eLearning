package com.example.tutoring.Poziv;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoCallRepository extends JpaRepository<VideoCall, Long>
{
    VideoCall findByCallCode(String callCode);
}
