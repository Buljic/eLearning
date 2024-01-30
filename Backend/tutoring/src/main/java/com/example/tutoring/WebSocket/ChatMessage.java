package com.example.tutoring.WebSocket;

public class ChatMessage
{
   private String message_text;
   private Long user2;
    //private String user2;
    //Ovo se moze koristiti u slucaju ako koristimo jedan endpoint , da razlikuje od koga stize poruka
    public ChatMessage(String message_text, Long user2)
    {
        this.message_text = message_text;
        this.user2 = user2;
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