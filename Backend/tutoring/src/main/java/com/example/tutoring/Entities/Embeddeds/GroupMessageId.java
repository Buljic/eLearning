package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Embeddable
public class GroupMessageId implements Serializable
{
    private Long group;
    private Long sender;
    private LocalDateTime time;

    public GroupMessageId(){}

    public GroupMessageId(long groupId, long sender, LocalDateTime time)
    {
        this.group = groupId;
        this.sender = sender;
        this.time = time;
    }

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

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (!(o instanceof GroupMessageId that)) return false;
        return Objects.equals(group, that.group)
                && Objects.equals(sender, that.sender)
                && Objects.equals(time, that.time);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(group, sender, time);
    }
}
