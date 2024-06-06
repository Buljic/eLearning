package com.example.tutoring.VideoCall;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Poziv.CreateVideoCallRequest;
import com.example.tutoring.Poziv.EndVideoCallRequest;
import com.example.tutoring.Poziv.VideoCall;
import com.example.tutoring.Poziv.VideoCallService;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Services.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping ("/api/videoCall")
public class VideoCallController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final GroupService groupService;
    private final Map<String, Long> sessionCodes = new ConcurrentHashMap<>();

    public VideoCallController(SimpMessagingTemplate messagingTemplate, UserRepository userRepository,
                               GroupService groupService) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.groupService = groupService;
    }

//    @PostMapping("/setCode")
//    public ResponseEntity<Void> setSessionCode(@RequestBody Map<String, String> payload) {
//        try {
//            String code = payload.get("code");
//            Long groupId = Long.parseLong(payload.get("groupId"));
//            System.out.println("Received code: " + code + ", groupId: " + groupId);
//            sessionCodes.put(code, groupId);
//            System.out.println("Session code set: " + code + " for group: " + groupId);
//            return ResponseEntity.ok().build();
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @MessageMapping("/video/join/{code}")
//    public void joinCall(@Payload String message, @DestinationVariable String code) {
//        System.out.println("Join request received for code: " + code + " with message: " + message);
//        messagingTemplate.convertAndSend("/topic/call/" + code, message);
//        System.out.println("User joined call for code: " + code);
//    }
//
//    @MessageMapping("/video/leave/{code}")
//    public void leaveCall(@Payload String message, @DestinationVariable String code) {
//        messagingTemplate.convertAndSend("/topic/call/" + code, message);
//        System.out.println("User left call for code: " + code + " with message: " + message);
//    }
//
//    @MessageMapping("/video/signal/{code}")
//    public void handleSignal(@Payload String signal, @DestinationVariable String code) {
//        messagingTemplate.convertAndSend("/topic/call/" + code, signal);
//        System.out.println("Signal handled for code: " + code + " with signal: " + signal);
//    }
    //TODO
//@MessageMapping("/videoCall/send")
//public void handleSignalingMessage(@Payload SignalingMessage message,
//                                   @Header ("simpSessionId") String sessionId) throws Exception {
//    // Broadcasting signal to other peers in the same room
//    messagingTemplate.convertAndSend("/topic/videoCall/" + message.getRoomId(), message);
//}

    @Autowired
    private VideoCallService videoCallService;

    @MessageMapping("/videoCall/join")
    @SendTo("/topic/videoCall")
    public Message join(Message message) {
        return message;
    }

    @MessageMapping("/videoCall/offer")
    @SendTo("/topic/videoCall")
    public Message offer(Message message) {
        return message;
    }

    @MessageMapping("/videoCall/answer")
    @SendTo("/topic/videoCall")
    public Message answer(Message message) {
        return message;
    }

    @MessageMapping("/videoCall/ice-candidate")
    @SendTo("/topic/videoCall")
    public Message iceCandidate(Message message) {
        return message;
    }

    @MessageMapping("/videoCall/leave")
    @SendTo("/topic/videoCall")
    public Message leave(Message message) {
        return message;
    }
}