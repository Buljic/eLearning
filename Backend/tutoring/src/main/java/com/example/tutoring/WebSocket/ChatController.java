package com.example.tutoring.WebSocket;

import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller //ne treba nam restcontrollerovdje jer koristimo @Messagemappiong
public class ChatController
{
    private final SimpMessagingTemplate template;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public ChatController(SimpMessagingTemplate template, JwtUtil jwtUtil, UserRepository userRepository)
    {
        this.template=template;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @MessageMapping("/message")
    public void processMessageFromClient(@Payload ChatMessage chatMessage, HttpServletRequest request)
    {
        String token=jwtUtil.extractJwtFromCookie(request);
        Integer ourUser=userRepository.getIdByUsername(jwtUtil.getUsernameFromToken(token));
        if(ourUser<chatMessage.getReceiver())
        {
            template.convertAndSend("/queue/"+ourUser.toString()+'/'+chatMessage.getReceiver().toString(),chatMessage.getMessage());
        }
        template.convertAndSend("/queue/"+chatMessage.getReceiver().toString()+'/'+ourUser.toString(),chatMessage.getMessage());
        //String username=jwtUtil.getUsernameFromToken(token);
        //mozes koristiti dinamicki endpoint ili jedan endpoint kod kojeg svaka poruka ima razliciti sender npr
        //template.convertAndSendToUser(chatMessage.getReceiver(),"/queue/messages",chatMessage);
    }
}
