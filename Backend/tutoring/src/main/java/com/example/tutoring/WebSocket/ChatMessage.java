package com.example.tutoring.WebSocket;

public class ChatMessage
{
   private String message_text;
   private Long user2;
    //private String user2;
    //Ovo se moze koristiti u slucaju ako koristimo jedan endpoint , da razlikuje od koga stize poruka
    private Long senderId;
    private String senderName;
    public ChatMessage(String message_text, Long user2)
    {
        this.message_text = message_text;
        this.user2 = user2;
    }
    public ChatMessage(String message_text, Long user2, Long senderId, String senderName) {
        this.message_text = message_text;
        this.user2 = user2;
        this.senderId = senderId;
        this.senderName = senderName;
    }

    public Long getSenderId()
    {
        return senderId;
    }

    public void setSenderId(Long senderId)
    {
        this.senderId = senderId;
    }

    public String getSenderName()
    {
        return senderName;
    }

    public void setSenderName(String senderName)
    {
        this.senderName = senderName;
    }

    public ChatMessage() {}

    public Long getUser2()
    {
        return user2;
    }

    public void setUser2(Long user2)
    {
        this.user2 = user2;
    }

    public String getMessage_text()
    {
        return message_text;
    }

    public void setMessage_text(String message_text)
    {
        this.message_text = message_text;
    }
}