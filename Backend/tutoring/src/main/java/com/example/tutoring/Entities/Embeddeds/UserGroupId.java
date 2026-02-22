package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserGroupId implements Serializable
{
    private Long groupId;
    private Long userId;

    public UserGroupId() {
    }

    public UserGroupId(Long groupId, Long userId) {
        this.groupId = groupId;
        this.userId = userId;
    }

    public Long getGroupId()
    {
        return groupId;
    }

    public Long getUserId()
    {
        return userId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (!(o instanceof UserGroupId that)) return false;
        return Objects.equals(groupId, that.groupId)
                && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(groupId, userId);
    }
}
