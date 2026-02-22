package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class GroupRequestId implements Serializable
{
    private Long userId;
    private Long groupId;

    public GroupRequestId(Long userId, Long groupId)
    {
        this.userId = userId;
        this.groupId = groupId;
    }

    public GroupRequestId()
    {

    }

    public Long getUserId()
    {
        return userId;
    }

    public Long getGroupId()
    {
        return groupId;
    }

    public void setUserId(Long userId)
    {
        this.userId = userId;
    }

    public void setGroupId(Long groupId)
    {
        this.groupId = groupId;
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (!(o instanceof GroupRequestId that)) return false;
        return Objects.equals(userId, that.userId)
                && Objects.equals(groupId, that.groupId);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(userId, groupId);
    }
}
