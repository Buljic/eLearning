package com.example.tutoring.VideoCall;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Services.GroupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
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

    @PostMapping("/setCode")
    public ResponseEntity<Void> setSessionCode(@RequestBody Map<String, String> payload) {
        try {
            String code = payload.get("code");
            Long groupId = Long.parseLong(payload.get("groupId"));
            System.out.println("Received code: " + code + ", groupId: " + groupId);
            sessionCodes.put(code, groupId);
            System.out.println("Session code set: " + code + " for group: " + groupId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @MessageMapping("/video/join/{code}")
    public void joinCall(@Payload String message, @DestinationVariable String code) {
        System.out.println("Join request received for code: " + code + " with message: " + message);
        messagingTemplate.convertAndSend("/topic/call/" + code, message);
        System.out.println("User joined call for code: " + code);
    }

    @MessageMapping("/video/leave/{code}")
    public void leaveCall(@Payload String message, @DestinationVariable String code) {
        messagingTemplate.convertAndSend("/topic/call/" + code, message);
        System.out.println("User left call for code: " + code + " with message: " + message);
    }

    @MessageMapping("/video/signal/{code}")
    public void handleSignal(@Payload String signal, @DestinationVariable String code) {
        messagingTemplate.convertAndSend("/topic/call/" + code, signal);
        System.out.println("Signal handled for code: " + code + " with signal: " + signal);
    }
}