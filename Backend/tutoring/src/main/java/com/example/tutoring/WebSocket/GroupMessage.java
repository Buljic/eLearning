package com.example.tutoring.WebSocket;

public class GroupMessage
{
    private String message_text;
    private Long sender;
    GroupMessage(String message_text,Long sender)
    {
        this.message_text=message_text;
        this.sender=sender;
    }
    GroupMessage(){}

    public String getMessage_text()
    {
        return message_text;
    }

    public void setMessage_text(String message_text)
    {
        this.message_text = message_text;
    }

    public Long getSender()
    {
        return sender;
    }

    public void setSender(Long sender)
    {
        this.sender = sender;
    }
}
