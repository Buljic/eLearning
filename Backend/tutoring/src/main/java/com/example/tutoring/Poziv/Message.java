package com.example.tutoring.Poziv;

import java.util.Set;

public class Message {
    private String type;
    private String sender;
    private String roomId;
    private String sdp;
    private String candidate;
    private String target;
    private Set<String> existingUsers;

    public Set<String> getExistingUsers()
    {
        return existingUsers;
    }

    public void setExistingUsers(Set<String> existingUsers)
    {
        this.existingUsers = existingUsers;
    }

    // Getters and setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getSdp() {
        return sdp;
    }

    public void setSdp(String sdp) {
        this.sdp = sdp;
    }

    public String getCandidate() {
        return candidate;
    }

    public void setCandidate(String candidate) {
        this.candidate = candidate;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }
}

