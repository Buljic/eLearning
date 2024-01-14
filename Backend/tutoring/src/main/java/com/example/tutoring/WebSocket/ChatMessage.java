package com.example.tutoring.WebSocket;

public class ChatMessage
{
   private String message;
   private Integer receiver;
    //private String receiver;
    //Ovo se moze koristiti u slucaju ako koristimo jedan endpoint , da razlikuje od koga stize poruka

    public Integer getReceiver()
    {
        return receiver;
    }

    public void setReceiver(Integer receiver)
    {
        this.receiver = receiver;
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
