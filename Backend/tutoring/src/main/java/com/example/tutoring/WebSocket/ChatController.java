package com.example.tutoring.WebSocket;

import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestParam;

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

    @MessageMapping("/{user1}/{user2}")//ima 'app' prefix   //mozda da se Principal nekako nastima da rjesi ovaj problem s servletom
    public void processMessageFromClient(@Payload ChatMessage chatMessage, @DestinationVariable String user1,
                                         @DestinationVariable String user2
            /*, HttpServletRequest request*/)
    {
        System.out.println(chatMessage.getMessage()+"OVO JE PORUKA NA BACKENDU");
            template.convertAndSend("/queue/"+user1+'/'+user2,chatMessage);
       // String token=jwtUtil.extractJwtFromCookie(request);
      //  Integer ourUser=userRepository.getIdByUsername(jwtUtil.getUsernameFromToken(token));
//        if(ourUser<chatMessage.getReceiver())
//        {
//            System.out.println(chatMessage.getMessage()+"OVO JE PORUKA NA BACKENDU");
//            template.convertAndSend("/queue/"+ourUser.toString()+'/'+chatMessage.getReceiver().toString(),chatMessage.getMessage());
//        }
//        else
//        {
//            template.convertAndSend("/queue/" + chatMessage.getReceiver().toString() + '/' + ourUser.toString(),
//                    chatMessage.getMessage());
//        }
        //String username=jwtUtil.getUsernameFromToken(token);
        //mozes koristiti dinamicki endpoint ili jedan endpoint kod kojeg svaka poruka ima razliciti sender npr
        //template.convertAndSendToUser(chatMessage.getReceiver(),"/queue/messages",chatMessage);
    }
}
