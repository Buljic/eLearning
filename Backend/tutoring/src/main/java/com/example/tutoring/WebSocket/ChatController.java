package com.example.tutoring.WebSocket;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.Entities.DirectMessage;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Services.MessageService;
import com.example.tutoring.Services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ChatController {
    private static final int MAX_PAGE_SIZE = 100;

    private final MessageService messageService;
    private final SimpMessagingTemplate template;
    private final UserService userService;
    private final GroupService groupService;

    public ChatController(
            MessageService messageService,
            SimpMessagingTemplate template,
            UserService userService,
            GroupService groupService
    ) {
        this.messageService = messageService;
        this.template = template;
        this.userService = userService;
        this.groupService = groupService;
    }

    @GetMapping("/{user1}/{user2}/getOldDirectMessages")
    public ResponseEntity<?> getOldDirectMessages(
            @PathVariable Long user1,
            @PathVariable Long user2,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (page < 0 || size <= 0 || size > MAX_PAGE_SIZE) {
            return ResponseEntity.badRequest().body("Invalid pagination values");
        }

        User currentUser = userService.findUserByUsername(principal.getName());
        Long currentUserId = currentUser.getId();
        if (!currentUserId.equals(user1) && !currentUserId.equals(user2)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        List<DirectMessage> messages = messageService.getOldDirectMessages(user1, user2, page, size);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{groupId}/getOldGroupMessages")
    public ResponseEntity<?> getOldGroupMessages(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (page < 0 || size <= 0 || size > MAX_PAGE_SIZE) {
            return ResponseEntity.badRequest().body("Invalid pagination values");
        }

        User currentUser = userService.findUserByUsername(principal.getName());
        if (!groupService.isUserInGroup(currentUser.getId(), groupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        List<GenericDTO> messages = messageService.getOldGroupMessages(groupId, page, size);
        return ResponseEntity.ok(messages);
    }

    @MessageMapping("/{user1}/{user2}")
    public void processMessageFromClient(
            @Payload ChatMessage chatMessage,
            @DestinationVariable String user1,
            @DestinationVariable String user2,
            Principal principal
    ) {
        if (principal == null || chatMessage == null || chatMessage.getMessage_text() == null) {
            return;
        }

        User currentUser = userService.findUserByUsername(principal.getName());
        Long currentUserId = currentUser.getId();

        Long firstUserId;
        Long secondUserId;
        try {
            firstUserId = Long.parseLong(user1);
            secondUserId = Long.parseLong(user2);
        } catch (NumberFormatException ignored) {
            return;
        }

        if (!currentUserId.equals(firstUserId) && !currentUserId.equals(secondUserId)) {
            return;
        }

        String trimmedMessage = chatMessage.getMessage_text().trim();
        if (trimmedMessage.isEmpty()) {
            return;
        }

        Long recipientId = currentUserId.equals(firstUserId) ? secondUserId : firstUserId;
        User recipientUser;
        try {
            recipientUser = userService.getUserById(recipientId);
        } catch (Exception ignored) {
            return;
        }

        messageService.saveDirectMessage(currentUserId, recipientId, trimmedMessage, currentUser.getUsername());

        String conversationKey = buildConversationKey(firstUserId, secondUserId);
        ChatMessage outbound = new ChatMessage();
        outbound.setMessage_text(trimmedMessage);
        outbound.setSenderId(currentUserId);
        outbound.setSenderName(currentUser.getUsername());
        outbound.setUser2(recipientId);

        template.convertAndSendToUser(
                currentUser.getUsername(),
                "/queue/direct/" + conversationKey,
                outbound
        );
        template.convertAndSendToUser(
                recipientUser.getUsername(),
                "/queue/direct/" + conversationKey,
                outbound
        );
    }

    @MessageMapping("/{groupId}")
    public void processMessageFromGroup(
            @DestinationVariable Long groupId,
            @Payload ChatMessage groupMessage,
            Principal principal
    ) {
        if (principal == null || groupMessage == null || groupMessage.getMessage_text() == null) {
            return;
        }

        User currentUser = userService.findUserByUsername(principal.getName());
        if (!groupService.isUserInGroup(currentUser.getId(), groupId)) {
            return;
        }

        String trimmedMessage = groupMessage.getMessage_text().trim();
        if (trimmedMessage.isEmpty()) {
            return;
        }

        messageService.saveGroupMessage(groupId, currentUser.getId(), trimmedMessage);

        ChatMessage outbound = new ChatMessage();
        outbound.setMessage_text(trimmedMessage);
        outbound.setSenderId(currentUser.getId());
        outbound.setSenderName(currentUser.getUsername());

        List<String> groupUsernames = groupService.getGroupMemberUsernames(groupId);
        for (String username : groupUsernames) {
            template.convertAndSendToUser(username, "/queue/group/" + groupId, outbound);
        }
    }

    private String buildConversationKey(Long user1, Long user2) {
        long minUserId = Math.min(user1, user2);
        long maxUserId = Math.max(user1, user2);
        return minUserId + "/" + maxUserId;
    }
}
