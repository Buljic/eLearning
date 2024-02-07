package com.example.tutoring.Entities;

import com.example.tutoring.Entities.Embeddeds.UserGroupId;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_group")
public class UserGroup
{
    @EmbeddedId
    private UserGroupId id;

    @ManyToOne
    @MapsId("groupId")
    @JoinColumn(name = "group_id")
    private Group group;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDate date_joined;

    public UserGroupId getId()
    {
        return id;
    }

    public LocalDate getDate_joined()
    {
        return date_joined;
    }

    public void setDate_joined(LocalDate date_joined)
    {
        this.date_joined = date_joined;
    }
}
