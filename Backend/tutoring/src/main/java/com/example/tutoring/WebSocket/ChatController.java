package com.example.tutoring.WebSocket;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.Entities.DirectMessage;
import com.example.tutoring.Entities.GroupMessage;
import com.example.tutoring.Repositories.DirectMessageRepository;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@Controller //ne treba nam restcontrollerovdje jer koristimo @Messagemappiong
//@RequestMapping ("/api")
//public class ChatController
//{
//    private final SimpMessagingTemplate template;
//    private final JwtUtil jwtUtil;
//    private final UserRepository userRepository;
//    private final DirectMessageRepository directMessageRepository;
//    private final MessageService messageService;
//
//    public ChatController(SimpMessagingTemplate template, JwtUtil jwtUtil, UserRepository userRepository,
//                          DirectMessageRepository directMessageRepository, MessageService messageService)
//    {
//        this.template=template;
//        this.jwtUtil = jwtUtil;
//        this.userRepository = userRepository;
//        this.directMessageRepository = directMessageRepository;
//        this.messageService = messageService;
//    }
//
////    @GetMapping ("/api/{user1}/{user2}/getOldDirectMessages")
////    public ResponseEntity<?> getOldDMs(@PathVariable String user1, @PathVariable String user2)
////    {
////       return ResponseEntity.status(HttpStatus.OK).body( messageService.getOldDMs(Long.parseLong(user2), Long.parseLong(user1)));
////    }
////    @GetMapping("/api/{chatId}/getOldGroupMessages")
////    public ResponseEntity<?> getOldChatMessages(@PathVariable Long chatId)
////    {
////        System.out.println("Doslo je do metode");
////        return ResponseEntity.status(HttpStatus.OK).body(messageService.getOldGroupMessages(chatId));
////    }
//
//    @GetMapping("/{user1}/{user2}/getOldDirectMessages")
//    public ResponseEntity<?> getOldDirectMessages(HttpServletRequest request, @PathVariable Long user1, @PathVariable Long user2,
//                                                  @RequestParam(defaultValue = "0") int page,
//                                                  @RequestParam(defaultValue = "10") int size) {
//        String token = jwtUtil.extractJwtFromCookie(request);
//        if (token != null) {
//            String role = jwtUtil.getRoleFromToken(token);
//            if (!role.equals("STUDENT") && !role.equals("PROFESSOR")) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
//            }
//        } else {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
//        }
//
//        List<DirectMessage> messages = messageService.getOldDirectMessages(user1, user2, page, size);
//        return ResponseEntity.ok(messages);
//    }
//
//    @GetMapping("/{groupId}/getOldGroupMessages")
//    public ResponseEntity<?> getOldGroupMessages(HttpServletRequest request, @PathVariable Long groupId,
//                                                 @RequestParam(defaultValue = "0") int page,
//                                                 @RequestParam(defaultValue = "10") int size) {
//        String token = jwtUtil.extractJwtFromCookie(request);
//        if (token != null) {
//            String role = jwtUtil.getRoleFromToken(token);
//            if (!role.equals("STUDENT") && !role.equals("PROFESOR")) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
//            }
//        } else {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
//        }
//
//        List<com.example.tutoring.Entities.GroupMessage> messages = messageService.getOldGroupMessages(groupId, page, size);
//        return ResponseEntity.ok(messages);
//    }
//
//    @MessageMapping("/{user1}/{user2}")//ima 'app' prefix   //mozda da se Principal nekako nastima da rjesi ovaj problem s servletom
//    public void processMessageFromClient(@Payload ChatMessage chatMessage, @DestinationVariable String user1,
//                                         @DestinationVariable String user2
//            /*, HttpServletRequest request*/)
//    {
//        System.out.println(chatMessage.getMessage_text()+" OVO JE PORUKA NA BACKENDU "+ user1+" "+user2);
//        //DirectMessageId id=new DirectMessageId(Long.parseLong(user1),Long.parseLong(user2), LocalDateTime.now());
//
//        if(user1.equals(chatMessage.getUser2().toString()))//receiver treba biti na drugom mjestu tj kao user2
//        {
//            messageService.saveDirectMessage(Long.parseLong(user2), Long.parseLong(user1), chatMessage.getMessage_text());
//        }else messageService.saveDirectMessage(Long.parseLong(user1), Long.parseLong(user2), chatMessage.getMessage_text());
//        System.out.println("USPJESNO");
//        template.convertAndSend("/queue/"+user1+'/'+user2,chatMessage);
//    }
//
//
//    @MessageMapping("/{groupId}")
//    public void processMessageFromGroup(@DestinationVariable Long groupId, @Payload GroupMessage groupMessage)
//    {
//        System.out.println("OVO JE GROUP PORUKA"+groupMessage.getMessage_text()+" "+groupMessage.getSender()+" sa group"+groupId);
//        messageService.saveGroupMessage(groupId,groupMessage.getSender(),groupMessage.getMessage_text());
//        template.convertAndSend("/queue/"+groupId.toString(),groupMessage);
//        System.out.println("Provjera da li uopste postoji ovo ovdje");
//        System.out.println("/queue/"+groupId);
//    }
//}

@RestController
@RequestMapping("/api")
public class ChatController {
    private final MessageService messageService;
    private final JwtUtil jwtUtil;
    private final SimpMessagingTemplate template;

    public ChatController(MessageService messageService, JwtUtil jwtUtil, SimpMessagingTemplate template) {
        this.messageService = messageService;
        this.jwtUtil = jwtUtil;
        this.template = template;
    }

    @GetMapping("/{user1}/{user2}/getOldDirectMessages")
    public ResponseEntity<?> getOldDirectMessages(HttpServletRequest request, @PathVariable Long user1, @PathVariable Long user2,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null) {
            String role = jwtUtil.getRoleFromToken(token);
            if (!role.equals("STUDENT") && !role.equals("PROFESOR")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        List<DirectMessage> messages = messageService.getOldDirectMessages(user1, user2, page, size);
        System.out.println("Fetched " + messages.size() + " direct messages from the database.");
        for (DirectMessage message : messages) {
            System.out.println("Message: " + message.getMessageText());
        }
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{groupId}/getOldGroupMessages")
    public ResponseEntity<?> getOldGroupMessages(HttpServletRequest request, @PathVariable Long groupId,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null) {
            String role = jwtUtil.getRoleFromToken(token);
            if (!role.equals("STUDENT") && !role.equals("PROFESOR")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        List<GroupMessage> messages = messageService.getOldGroupMessages(groupId, page, size);
        System.out.println("Fetched " + messages.size() + " group messages from the database.");
        for (GroupMessage message : messages) {
            System.out.println("Message: " + message.getMessage_text());
        }
        return ResponseEntity.ok(messages);
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


    @MessageMapping("/{groupId}")
    public void processMessageFromGroup(@DestinationVariable Long groupId, @Payload GroupMessageDTO groupMessage)
    {
        System.out.println("OVO JE GROUP PORUKA"+groupMessage.getMessage_text()+" "+groupMessage.getSender()+" sa group"+groupId);
        messageService.saveGroupMessage(groupId,groupMessage.getSender(),groupMessage.getMessage_text());
        template.convertAndSend("/queue/"+groupId.toString(),groupMessage);
        System.out.println("Provjera da li uopste postoji ovo ovdje");
        System.out.println("/queue/"+groupId);
    }


}

