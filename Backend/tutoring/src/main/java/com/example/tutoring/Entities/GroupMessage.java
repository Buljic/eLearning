package com.example.tutoring.Entities;

import com.example.tutoring.Entities.Embeddeds.GroupMessageId;
import jakarta.persistence.*;

@Entity
@Table(name = "group_message")
public class GroupMessage
{
    @EmbeddedId
    private GroupMessageId id;

    @ManyToOne
    @MapsId("sender")
    @JoinColumn(name="sender")
    private User user;

    @ManyToOne
    @MapsId("group")
    @JoinColumn(name = "group_id") //jer ne smijes kljucnu rijec group koristiti
    private Group group;

    private String message_text;

   public GroupMessage(){}

    public String getMessage_text()
    {
        return message_text;
    }

    public void setMessage_text(String message_text)
    {
        this.message_text = message_text;
    }

    public void setId(GroupMessageId id)
    {
        this.id = id;
    }

    public User getUser()
    {
        return user;
    }

    public void setUser(User user)
    {
        this.user = user;
    }

    public Group getGroup()
    {
        return group;
    }

    public void setGroup(Group group)
    {
        this.group = group;
    }

    public GroupMessageId getId()
    {
        return id;
    }
}
