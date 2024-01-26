package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.time.LocalDateTime;

@Embeddable
public class DirectMessageId implements Serializable
{
    private Long user1;
    private Long user2;
    private LocalDateTime time;

    public Long getUser1()
    {
        return user1;
    }

    public void setUser1(Long user1)
    {
        this.user1 = user1;
    }

    public Long getUser2()
    {
        return user2;
    }

    public void setUser2(Long user2)
    {
        this.user2 = user2;
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
