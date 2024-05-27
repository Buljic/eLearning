package com.example.tutoring.WebSocket;

public class GroupMessageDTO
{
    private String message_text;
    private Long sender;
    GroupMessageDTO(String message_text, Long sender)
    {
        this.message_text=message_text;
        this.sender=sender;
    }
    GroupMessageDTO(){}

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
