package com.example.tutoring.WebSocket;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.Repositories.DirectMessageRepository;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.MessageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller //ne treba nam restcontrollerovdje jer koristimo @Messagemappiong
public class ChatController
{
    private final SimpMessagingTemplate template;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final DirectMessageRepository directMessageRepository;
    private final MessageService messageService;

    public ChatController(SimpMessagingTemplate template, JwtUtil jwtUtil, UserRepository userRepository,
                          DirectMessageRepository directMessageRepository, MessageService messageService)
    {
        this.template=template;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.directMessageRepository = directMessageRepository;
        this.messageService = messageService;
    }

    @GetMapping ("/api/{user1}/{user2}/getOldDirectMessages")
    public ResponseEntity<?> getOldDMs(@PathVariable String user1, @PathVariable String user2)
    {
       return ResponseEntity.status(HttpStatus.OK).body( messageService.getOldDMs(Long.parseLong(user2), Long.parseLong(user1)));
    }

    @MessageMapping("/{user1}/{user2}")//ima 'app' prefix   //mozda da se Principal nekako nastima da rjesi ovaj problem s servletom
    public void processMessageFromClient(@Payload ChatMessage chatMessage, @DestinationVariable String user1,
                                         @DestinationVariable String user2
            /*, HttpServletRequest request*/)
    {
        System.out.println(chatMessage.getMessage_text()+" OVO JE PORUKA NA BACKENDU "+ user1+" "+user2);
        //DirectMessageId id=new DirectMessageId(Long.parseLong(user1),Long.parseLong(user2), LocalDateTime.now());

        if(user1.equals(chatMessage.getUser2().toString()))//receiver treba biti na drugom mjestu tj kao user2
        {
            messageService.saveDirectMessage(Long.parseLong(user2), Long.parseLong(user1), chatMessage.getMessage_text());
        }else messageService.saveDirectMessage(Long.parseLong(user1), Long.parseLong(user2), chatMessage.getMessage_text());
        System.out.println("USPJESNO");
        template.convertAndSend("/queue/"+user1+'/'+user2,chatMessage);
    }

    @MessageMapping("/{group}")
    public void processMessageFromGroup(@DestinationVariable Long group, @Payload GroupMessage groupMessage)
    {
        System.out.println("OVO JE GROUP PORUKA"+groupMessage.getMessage_text()+" "+groupMessage.getSender()+" sa group"+group);
        messageService.saveGroupMessage(group,groupMessage.getSender(),groupMessage.getMessage_text());
        template.convertAndSend("/topic/"+group,groupMessage);
    }
}
