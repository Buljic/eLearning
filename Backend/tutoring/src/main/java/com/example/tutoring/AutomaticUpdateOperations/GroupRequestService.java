package com.example.tutoring.AutomaticUpdateOperations;

import com.example.tutoring.Entities.Embeddeds.GroupRequestId;
import com.example.tutoring.Entities.GroupRequest;
import com.example.tutoring.Other.RequestStatus;
import com.example.tutoring.WebSocket.ChatMessage;
import jakarta.transaction.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroupRequestService {
    private final JdbcTemplate jdbcTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public GroupRequestService(JdbcTemplate jdbcTemplate, SimpMessagingTemplate messagingTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.messagingTemplate = messagingTemplate;
    }

    public List<GroupRequest> getAcceptedGroupRequests() {
        String sql = "SELECT gr.*, u.username FROM group_requests gr JOIN user u ON gr.user_id = u.id WHERE status = 'ACCEPTED' AND request_date <= CURRENT_DATE";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            GroupRequest request = new GroupRequest();
            GroupRequestId id = new GroupRequestId();
            id.setUserId(rs.getLong("user_id"));
            id.setGroupId(rs.getLong("group_id"));
            request.setId(id);
            request.setStatus(RequestStatus.valueOf(rs.getString("status")));
            request.setRequestDate(rs.getDate("request_date").toLocalDate());
            request.setUsername(rs.getString("username"));
            return request;
        });
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void updateRequestStatuses() {
        List<GroupRequest> pendingRequests = jdbcTemplate.query(
                "SELECT * FROM group_requests WHERE status = 'PENDING' AND request_date < ?",
                new Object[]{LocalDate.now()},
                (rs, rowNum) -> {
                    GroupRequest request = new GroupRequest();
                    GroupRequestId id = new GroupRequestId();
                    id.setUserId(rs.getLong("user_id"));
                    id.setGroupId(rs.getLong("group_id"));
                    request.setId(id);
                    request.setStatus(RequestStatus.valueOf(rs.getString("status")));
                    request.setRequestDate(rs.getDate("request_date").toLocalDate());
                    return request;
                }
        );

        for (GroupRequest request : pendingRequests) {
            jdbcTemplate.update(
                    "UPDATE group_requests SET status = 'REJECTED' WHERE user_id = ? AND group_id = ?",
                    request.getId().getUserId(),
                    request.getId().getGroupId()
            );
            sendAutomatedMessage(
                    request.getId().getUserId(),
                    "Vas zahtjev za grupu " + request.getId().getGroupId() + " je odbijen jer niste platili na vrijeme."
            );
        }
    }

    private void sendAutomatedMessage(Long userId, String message) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setMessage_text(message);
        String username = jdbcTemplate.queryForObject(
                "SELECT username FROM user WHERE id = ?",
                new Object[]{userId},
                String.class
        );
        if (username != null && !username.isBlank()) {
            messagingTemplate.convertAndSendToUser(username, "/queue/notifications", chatMessage);
        }
    }

    public Map<String, Object> getRequests(String tutorUsername, int page, int size) {
        List<GroupRequest> requests = jdbcTemplate.query(
                "SELECT gr.*, g.group_name, u.username FROM group_requests gr " +
                        "JOIN group_table g ON gr.group_id = g.group_id " +
                        "JOIN user u ON gr.user_id = u.id " +
                        "WHERE gr.status != 'REJECTED' AND gr.status != 'ACCEPTED' " +
                        "AND g.headtutor_id = (SELECT id FROM user WHERE username = ?) " +
                        "LIMIT ? OFFSET ?",
                new Object[]{tutorUsername, size, page * size},
                (rs, rowNum) -> {
                    GroupRequest request = new GroupRequest();
                    GroupRequestId id = new GroupRequestId();
                    id.setUserId(rs.getLong("user_id"));
                    id.setGroupId(rs.getLong("group_id"));
                    request.setId(id);
                    request.setStatus(RequestStatus.valueOf(rs.getString("status")));
                    request.setRequestDate(rs.getDate("request_date").toLocalDate());
                    request.setGroupName(rs.getString("group_name"));
                    request.setUsername(rs.getString("username"));
                    return request;
                }
        );

        int totalRequests = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM group_requests gr " +
                        "JOIN group_table g ON gr.group_id = g.group_id " +
                        "WHERE gr.status != 'REJECTED' AND gr.status != 'ACCEPTED' " +
                        "AND g.headtutor_id = (SELECT id FROM user WHERE username = ?)",
                new Object[]{tutorUsername},
                Integer.class
        );

        int totalPages = (int) Math.ceil((double) totalRequests / size);

        Map<String, Object> result = new HashMap<>();
        result.put("requests", requests);
        result.put("totalPages", totalPages);
        return result;
    }

    @Transactional
    public void acceptRequest(Long groupId, Long userId) {
        int updatedRows = jdbcTemplate.update(
                "UPDATE group_requests SET status = 'PENDING' WHERE user_id = ? AND group_id = ? AND status = 'REQUESTED'",
                userId,
                groupId
        );
        if (updatedRows == 0) {
            throw new IllegalStateException("Zahtjev nije u stanju koje dozvoljava prihvatanje.");
        }
        sendAutomatedMessage(userId, "Vas zahtjev za grupu " + groupId + " je prihvacen.");
    }

    @Transactional
    public void approveRequest(Long groupId, Long userId) {
        Integer requestExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM group_requests WHERE user_id = ? AND group_id = ? AND status = 'PENDING'",
                new Object[]{userId, groupId},
                Integer.class
        );
        if (requestExists == null || requestExists == 0) {
            throw new IllegalStateException("Zahtjev nije u stanju koje dozvoljava odobravanje.");
        }

        int maxStudents = jdbcTemplate.queryForObject(
                "SELECT max_students FROM group_table WHERE group_id = ? FOR UPDATE",
                new Object[]{groupId},
                Integer.class
        );

        int currentAccepted = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM group_requests WHERE group_id = ? AND status = 'ACCEPTED'",
                new Object[]{groupId},
                Integer.class
        );

        if (currentAccepted >= maxStudents) {
            throw new RuntimeException("Nema dovoljno mjesta u grupi za prihvatanje zahtjeva.");
        }

        jdbcTemplate.update(
                "UPDATE group_requests SET status = 'ACCEPTED' WHERE user_id = ? AND group_id = ?",
                userId,
                groupId
        );

        Integer alreadyInGroup = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM user_group WHERE user_id = ? AND group_id = ?",
                new Object[]{userId, groupId},
                Integer.class
        );
        if (alreadyInGroup == null || alreadyInGroup == 0) {
            jdbcTemplate.update(
                    "INSERT INTO user_group (user_id, group_id, date_joined) VALUES (?, ?, ?)",
                    userId,
                    groupId,
                    LocalDate.now()
            );
        }

        sendAutomatedMessage(userId, "Vas zahtjev za grupu " + groupId + " je odobren.");
    }

    @Transactional
    public void rejectRequest(Long groupId, Long userId) {
        int updatedRows = jdbcTemplate.update(
                "UPDATE group_requests SET status = 'REJECTED' WHERE user_id = ? AND group_id = ? AND status <> 'ACCEPTED'",
                userId,
                groupId
        );
        if (updatedRows == 0) {
            throw new IllegalStateException("Zahtjev nije moguce odbiti.");
        }
        sendAutomatedMessage(userId, "Vas zahtjev za grupu " + groupId + " je odbijen.");
    }
}
