package com.example.tutoring.Poziv;

import jakarta.persistence.*;

@Entity
public class Participant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "video_call_id")
    private VideoCall videoCall;

    private String username;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public VideoCall getVideoCall()
    {
        return videoCall;
    }

    public void setVideoCall(VideoCall videoCall)
    {
        this.videoCall = videoCall;
    }

    public String getUsername()
    {
        return username;
    }

    public void setUsername(String username)
    {
        this.username = username;
    }
}
