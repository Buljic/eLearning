package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class UserGroupId implements Serializable
{
    private Long groupId;
    private Long userId;

    public Long getGroupId()
    {
        return groupId;
    }

    public Long getUserId()
    {
        return userId;
    }
}
