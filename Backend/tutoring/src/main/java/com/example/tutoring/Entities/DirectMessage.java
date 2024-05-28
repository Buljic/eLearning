package com.example.tutoring.Entities;

import com.example.tutoring.Entities.Embeddeds.DirectMessageId;
import jakarta.persistence.*;

@Entity
@Table(name = "direct_message")
public class DirectMessage
{
    @EmbeddedId
    private DirectMessageId id;

    @ManyToOne
    @MapsId("user1")
    @JoinColumn(name = "user1")
    private User user1;

    @ManyToOne
    @MapsId("user2")
    @JoinColumn(name="user2")
    private User user2;

    private String messageText;

    @Transient
    private String senderName;

    public DirectMessage() {}
    public DirectMessage(DirectMessageId id, String messageText)
    {
        this.id = id;
        this.messageText = messageText;
    }
    public DirectMessageId getId()
    {
        return id;
    }
    public void setId(DirectMessageId id)
    {
        this.id = id;
    }
    public String getMessageText()
    {
        return messageText;
    }
    public void setMessageText(String messageText)
    {
        this.messageText = messageText;
    }

    public String getSenderName()
    {
        return senderName;
    }

    public void setSenderName(String senderName)
    {
        this.senderName = senderName;
    }

    public User getUser1()
    {
        return user1;
    }

    public void setUser1(User user1)
    {
        this.user1 = user1;
    }

    public User getUser2()
    {
        return user2;
    }

    public void setUser2(User user2)
    {
        this.user2 = user2;
    }
}
