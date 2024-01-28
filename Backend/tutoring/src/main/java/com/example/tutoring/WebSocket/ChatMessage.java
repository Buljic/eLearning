package com.example.tutoring.WebSocket;

public class ChatMessage
{
   private String message;
   private Long user2;
    //private String user2;
    //Ovo se moze koristiti u slucaju ako koristimo jedan endpoint , da razlikuje od koga stize poruka
    public ChatMessage(String message, Long user2)
    {
        this.message = message;
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

    public String getMessage()
    {
        return message;
    }

    public void setMessage(String message)
    {
        this.message = message;
    }
}