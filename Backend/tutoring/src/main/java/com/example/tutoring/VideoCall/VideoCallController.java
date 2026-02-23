package com.example.tutoring.VideoCall;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Poziv.Message;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Services.UserService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Controller
public class VideoCallController {

    private final ConcurrentMap<String, Set<String>> usersByRoom = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;
    private final GroupService groupService;

    public VideoCallController(
            SimpMessagingTemplate messagingTemplate,
            UserService userService,
            GroupService groupService
    ) {
        this.messagingTemplate = messagingTemplate;
        this.userService = userService;
        this.groupService = groupService;
    }

    @MessageMapping("/videoCall/join")
    public void join(Message message, Principal principal) {
        String username = getAuthenticatedUsername(principal);
        if (username == null || message == null || message.getRoomId() == null || !canAccessRoom(message.getRoomId(), username)) {
            return;
        }

        Set<String> roomUsers = usersByRoom.computeIfAbsent(
                message.getRoomId(),
                room -> ConcurrentHashMap.newKeySet()
        );

        roomUsers.add(username);

        Message joinMessage = new Message();
        joinMessage.setType("join");
        joinMessage.setSender(username);
        joinMessage.setRoomId(message.getRoomId());
        messagingTemplate.convertAndSend("/topic/videoCall/" + message.getRoomId(), joinMessage);

        Message existingUsersMessage = new Message();
        existingUsersMessage.setType("existingUsers");
        existingUsersMessage.setSender(username);
        existingUsersMessage.setRoomId(message.getRoomId());
        existingUsersMessage.setTarget(username);

        Set<String> existingUsers = new HashSet<>(roomUsers);
        existingUsers.remove(username);
        existingUsersMessage.setExistingUsers(existingUsers);

        messagingTemplate.convertAndSend("/topic/videoCall/" + message.getRoomId(), existingUsersMessage);
    }

    @MessageMapping("/videoCall/offer")
    public void offer(Message message, Principal principal) {
        relaySignalingMessage(message, principal, true);
    }

    @MessageMapping("/videoCall/answer")
    public void answer(Message message, Principal principal) {
        relaySignalingMessage(message, principal, true);
    }

    @MessageMapping("/videoCall/ice-candidate")
    public void iceCandidate(Message message, Principal principal) {
        relaySignalingMessage(message, principal, true);
    }

    @MessageMapping("/videoCall/leave")
    public void leave(Message message, Principal principal) {
        String username = getAuthenticatedUsername(principal);
        if (username == null || message == null || message.getRoomId() == null || !canAccessRoom(message.getRoomId(), username)) {
            return;
        }

        Set<String> roomUsers = usersByRoom.get(message.getRoomId());
        if (roomUsers != null) {
            roomUsers.remove(username);
            if (roomUsers.isEmpty()) {
                usersByRoom.remove(message.getRoomId());
            }
        }

        Message leaveMessage = new Message();
        leaveMessage.setType("leave");
        leaveMessage.setSender(username);
        leaveMessage.setRoomId(message.getRoomId());

        messagingTemplate.convertAndSend("/topic/videoCall/" + message.getRoomId(), leaveMessage);
    }

    private void relaySignalingMessage(Message message, Principal principal, boolean requireTarget) {
        String username = getAuthenticatedUsername(principal);
        if (username == null || message == null || message.getRoomId() == null || !canAccessRoom(message.getRoomId(), username)) {
            return;
        }
        if (requireTarget && (message.getTarget() == null || message.getTarget().isBlank())) {
            return;
        }

        message.setSender(username);
        messagingTemplate.convertAndSend("/topic/videoCall/" + message.getRoomId(), message);
    }

    private String getAuthenticatedUsername(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return null;
        }
        return principal.getName();
    }

    private boolean canAccessRoom(String roomId, String username) {
        if ("global".equalsIgnoreCase(roomId)) {
            return true;
        }
        Long groupId;
        try {
            groupId = Long.parseLong(roomId);
        } catch (NumberFormatException ignored) {
            return false;
        }

        User user = userService.findUserByUsername(username);
        return groupService.isUserInGroup(user.getId(), groupId);
    }
}
