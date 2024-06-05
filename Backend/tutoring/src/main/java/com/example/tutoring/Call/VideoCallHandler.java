package com.example.tutoring.Call;

import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.json.JSONObject;

import java.util.concurrent.CopyOnWriteArrayList;
import com.example.tutoring.Services.UserService;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Entities.User;
import jakarta.servlet.http.Cookie;
//import .servlet.http.Cookie;
import java.util.Optional;

@Component
public class VideoCallHandler extends TextWebSocketHandler {

    private static final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private static final CopyOnWriteArrayList<Long> professorsInCall = new CopyOnWriteArrayList<>();
    private static final Logger logger = LoggerFactory.getLogger(VideoCallHandler.class);

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("Connection established with session ID: {}", session.getId());
        sessions.add(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        logger.info("Received message: {}", payload);
        JSONObject jsonObject = new JSONObject(payload);
        String groupId = jsonObject.getString("groupId");
        String action = jsonObject.optString("action");

        // Extract the token from session attributes
        String token = (String) session.getAttributes().get("token");

        if (token != null && jwtUtil.validateToken(token)) {
            Optional<User> user = userService.getUserFromToken(token);
            if (user.isPresent() && groupService.isUserInGroup(user.get().getId(), Long.parseLong(groupId))) {
                User currentUser = user.get();
                boolean isProfessor = currentUser.getAccountType().equals("PROFESOR");

                if (isProfessor && "start".equals(action)) {
                    professorsInCall.add(currentUser.getId());
                    logger.info("Professor {} started the call", currentUser.getUsername());
                    broadcastMessage(session, message);
                } else if (!isProfessor && professorsInCall.isEmpty()) {
                    logger.warn("Student {} attempted to join a call before professor", currentUser.getUsername());
                    session.sendMessage(new TextMessage("{\"error\":\"Lekcija nije zapoceta\"}"));
                    session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Professor not in call"));
                } else if (isProfessor || (!isProfessor && !professorsInCall.isEmpty())) {
                    broadcastMessage(session, message);
                }
            } else {
                logger.error("User not in group or not found");
                session.close(CloseStatus.NOT_ACCEPTABLE.withReason("User not in group"));
            }
        } else {
            logger.error("Invalid token");
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid token"));
        }
    }

    private void broadcastMessage(WebSocketSession session, TextMessage message) throws Exception {
        for (WebSocketSession webSocketSession : sessions) {
            if (webSocketSession.isOpen() && !session.getId().equals(webSocketSession.getId())) {
                webSocketSession.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        String token = (String) session.getAttributes().get("token");

        if (token != null && jwtUtil.validateToken(token)) {
            Optional<User> user = userService.getUserFromToken(token);
            if (user.isPresent()) {
                User currentUser = user.get();
                if (currentUser.getAccountType()== AccountType.PROFESOR) {
                    professorsInCall.remove(currentUser.getId());
                    logger.info("Professor {} ended the call", currentUser.getUsername());
                    // End the call for all users if the professor leaves
                    for (WebSocketSession webSocketSession : sessions) {
                        webSocketSession.close(CloseStatus.NORMAL);
                    }
                    sessions.clear();
                }
            }
        }
    }
}