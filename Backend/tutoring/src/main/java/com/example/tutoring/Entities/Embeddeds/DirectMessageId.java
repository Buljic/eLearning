package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Embeddable
public class DirectMessageId implements Serializable
{
    private Long user1;
    private Long user2;
    private LocalDateTime time;

    public DirectMessageId()
    {
    }

    public DirectMessageId(Long user1, Long user2, LocalDateTime time)
    {
        this.user1 = user1;
        this.user2 = user2;
        this.time = time;
    }

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

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (!(o instanceof DirectMessageId that)) return false;
        return Objects.equals(user1, that.user1)
                && Objects.equals(user2, that.user2)
                && Objects.equals(time, that.time);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(user1, user2, time);
    }
}
