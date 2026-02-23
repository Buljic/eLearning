package com.example.tutoring.VideoCall;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Poziv.Message;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Services.UserService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Controller
public class VideoCallController {
    private final ConcurrentMap<String, Set<String>> usersByRoom = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, String> roomBySessionId = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, String> usernameBySessionId = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Integer> sessionCountByRoomUser = new ConcurrentHashMap<>();

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
    public void join(Message message, Principal principal, @Header("simpSessionId") String sessionId) {
        String username = getAuthenticatedUsername(principal);
        if (username == null || sessionId == null || message == null || message.getRoomId() == null) {
            return;
        }
        String roomId = message.getRoomId();
        if (!canAccessRoom(roomId, username)) {
            return;
        }

        roomBySessionId.put(sessionId, roomId);
        usernameBySessionId.put(sessionId, username);

        String roomUserMapKey = roomUserKey(roomId, username);
        int activeSessionsForUser = sessionCountByRoomUser.merge(roomUserMapKey, 1, Integer::sum);
        boolean firstSessionInRoom = activeSessionsForUser == 1;

        Set<String> roomUsers = usersByRoom.computeIfAbsent(roomId, room -> ConcurrentHashMap.newKeySet());
        if (firstSessionInRoom) {
            roomUsers.add(username);
        }

        Set<String> existingUsers = new HashSet<>(roomUsers);
        existingUsers.remove(username);

        Message existingUsersMessage = new Message();
        existingUsersMessage.setType("existingUsers");
        existingUsersMessage.setSender(username);
        existingUsersMessage.setRoomId(roomId);
        existingUsersMessage.setTarget(username);
        existingUsersMessage.setExistingUsers(existingUsers);
        sendToUser(username, roomId, existingUsersMessage);

        if (firstSessionInRoom) {
            Message joinMessage = new Message();
            joinMessage.setType("join");
            joinMessage.setSender(username);
            joinMessage.setRoomId(roomId);
            for (String existingUser : existingUsers) {
                sendToUser(existingUser, roomId, joinMessage);
            }
        }
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
    public void leave(Message message, Principal principal, @Header("simpSessionId") String sessionId) {
        String username = getAuthenticatedUsername(principal);
        String roomId = message == null ? null : message.getRoomId();
        removeSessionMembership(sessionId, roomId, username, true);
    }

    @EventListener
    public void onSessionDisconnect(SessionDisconnectEvent event) {
        removeSessionMembership(event.getSessionId(), null, null, true);
    }

    private void relaySignalingMessage(Message message, Principal principal, boolean requireTarget) {
        String username = getAuthenticatedUsername(principal);
        if (username == null || message == null || message.getRoomId() == null) {
            return;
        }
        String roomId = message.getRoomId();
        if (!canAccessRoom(roomId, username)) {
            return;
        }
        if (requireTarget && (message.getTarget() == null || message.getTarget().isBlank())) {
            return;
        }

        Set<String> roomUsers = usersByRoom.get(roomId);
        if (roomUsers == null || !roomUsers.contains(username) || !roomUsers.contains(message.getTarget())) {
            return;
        }

        message.setSender(username);
        sendToUser(message.getTarget(), roomId, message);
    }

    private void removeSessionMembership(String sessionId, String hintedRoomId, String hintedUsername, boolean notifyOthers) {
        if (sessionId == null) {
            return;
        }

        String roomId = roomBySessionId.remove(sessionId);
        if (roomId == null) {
            roomId = hintedRoomId;
        }
        String username = usernameBySessionId.remove(sessionId);
        if (username == null) {
            username = hintedUsername;
        }
        if (roomId == null || username == null) {
            return;
        }

        String roomUserMapKey = roomUserKey(roomId, username);
        Integer remainingSessions = sessionCountByRoomUser.compute(roomUserMapKey, (key, currentCount) -> {
            if (currentCount == null || currentCount <= 1) {
                return null;
            }
            return currentCount - 1;
        });

        if (remainingSessions != null) {
            return;
        }

        Set<String> roomUsers = usersByRoom.get(roomId);
        if (roomUsers == null) {
            return;
        }

        roomUsers.remove(username);
        if (roomUsers.isEmpty()) {
            usersByRoom.remove(roomId);
            return;
        }

        if (!notifyOthers) {
            return;
        }

        Message leaveMessage = new Message();
        leaveMessage.setType("leave");
        leaveMessage.setSender(username);
        leaveMessage.setRoomId(roomId);

        Set<String> recipients = new HashSet<>(roomUsers);
        for (String recipient : recipients) {
            sendToUser(recipient, roomId, leaveMessage);
        }
    }

    private void sendToUser(String username, String roomId, Message message) {
        messagingTemplate.convertAndSendToUser(username, "/queue/videoCall/" + roomId, message);
    }

    private String getAuthenticatedUsername(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return null;
        }
        return principal.getName();
    }

    private boolean canAccessRoom(String roomId, String username) {
        Long groupId;
        try {
            groupId = Long.parseLong(roomId);
        } catch (NumberFormatException ignored) {
            return false;
        }

        User user;
        try {
            user = userService.findUserByUsername(username);
        } catch (Exception ignored) {
            return false;
        }
        return groupService.isUserInGroup(user.getId(), groupId);
    }

    private String roomUserKey(String roomId, String username) {
        return roomId + ":" + username;
    }
}
