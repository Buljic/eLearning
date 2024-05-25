package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class GroupRequestId implements Serializable
{
    private Long userId;
    private Long groupId;

    public Long getUserId()
    {
        return userId;
    }

    public Long getGroupId()
    {
        return groupId;
    }
}