package com.example.tutoring.WebSocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller //ne treba nam restcontrollerovdje jer koristimo @Messagemappiong
public class ChatController
{
    private final SimpMessagingTemplate template;

    public ChatController(SimpMessagingTemplate template)
    {
        this.template=template;
    }
//    @MessageMapping("/message")
//    @SentTo("/topic/messages")
//    public ChatMessage sendMessage(ChatMessage message)
//    {
//        return message;
//    }
}
