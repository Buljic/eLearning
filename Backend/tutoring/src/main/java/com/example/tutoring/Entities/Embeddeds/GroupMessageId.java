package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.time.LocalDateTime;

@Embeddable
public class GroupMessageId implements Serializable
{
    private Long group;
    private Long sender;
    private LocalDateTime time;

    public Long getGroup()
    {
        return group;
    }

    public void setGroup(Long group)
    {
        this.group = group;
    }

    public Long getSender()
    {
        return sender;
    }

    public void setSender(Long sender)
    {
        this.sender = sender;
    }

    public LocalDateTime getTime()
    {
        return time;
    }

    public void setTime(LocalDateTime time)
    {
        this.time = time;
    }
}
