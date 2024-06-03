package com.example.tutoring.Call;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import com.example.tutoring.Services.UserService;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Entities.User;
import org.springframework.web.socket.CloseStatus;

@Component
public class VideoCallHandler extends TextWebSocketHandler {

    private static final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        JSONObject jsonObject = new JSONObject(payload);
        String groupId = jsonObject.getString("groupId");
        String token = jsonObject.getString("token");

        Optional<User> user = userService.getUserFromToken(token);
        if (user.isPresent() && groupService.isUserInGroup(user.get().getId(), Long.parseLong(groupId))) {
            for (WebSocketSession webSocketSession : sessions) {
                if (webSocketSession.isOpen() && !session.getId().equals(webSocketSession.getId())) {
                    webSocketSession.sendMessage(message);
                }
            }
        } else {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("User not in group"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }
}