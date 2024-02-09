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
    @JoinColumn(name = "group")
    private Group group;

    private String message_text;

    public String getMessage_text()
    {
        return message_text;
    }

    public void setMessage_text(String message_text)
    {
        this.message_text = message_text;
    }

    public GroupMessageId getId()
    {
        return id;
    }
}
