package com.example.tutoring.Poziv;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class VideoCall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String callCode;
    private String hostUsername;

    @Enumerated(EnumType.STRING)
    private CallStatus status; // ACTIVE, ENDED

    @OneToMany(mappedBy = "videoCall", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Participant> participants;

    // Getters and Setters

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public String getCallCode()
    {
        return callCode;
    }

    public void setCallCode(String callCode)
    {
        this.callCode = callCode;
    }

    public String getHostUsername()
    {
        return hostUsername;
    }

    public void setHostUsername(String hostUsername)
    {
        this.hostUsername = hostUsername;
    }

    public CallStatus getStatus()
    {
        return status;
    }

    public void setStatus(CallStatus status)
    {
        this.status = status;
    }

    public List<Participant> getParticipants()
    {
        return participants;
    }

    public void setParticipants(List<Participant> participants)
    {
        this.participants = participants;
    }
}
