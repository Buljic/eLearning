package com.example.tutoring.VideoCall;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Repositories.UserRepository;
import com.example.tutoring.Services.GroupService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

@Controller
public class VideoCallController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final GroupService groupService;

    public VideoCallController(SimpMessagingTemplate messagingTemplate, UserRepository userRepository,
                               GroupService groupService) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.groupService = groupService;
    }

    @MessageMapping("/video/join/{groupId}")
    public void joinCall(@Payload String message, @DestinationVariable Long groupId) {
        boolean isTutorPresent = groupService.isTutorPresentInGroup(groupId);

        if (isTutorPresent) {
            messagingTemplate.convertAndSend("/topic/call/" + groupId, message);
        } else {
            messagingTemplate.convertAndSendToUser(message, "/queue/errors", "Tutor is not present in the group.");
        }
    }

    @MessageMapping("/video/leave/{groupId}")
    public void leaveCall(@Payload String message, @DestinationVariable Long groupId) {
        messagingTemplate.convertAndSend("/topic/call/" + groupId, message);
    }

    @MessageMapping("/video/signal/{groupId}")
    public void handleSignal(@Payload String signal, @DestinationVariable Long groupId) {
        messagingTemplate.convertAndSend("/topic/call/" + groupId, signal);
    }
}