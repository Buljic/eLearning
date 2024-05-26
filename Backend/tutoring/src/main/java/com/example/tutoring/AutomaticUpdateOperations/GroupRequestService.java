package com.example.tutoring.AutomaticUpdateOperations;

import com.example.tutoring.Entities.Embeddeds.GroupRequestId;
import com.example.tutoring.Entities.GroupRequest;
import com.example.tutoring.Other.GroupRequestMapper;
import com.example.tutoring.Other.RequestStatus;
import com.example.tutoring.WebSocket.ChatMessage;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
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
//    // Metoda za provjeru i update statusa zahtjeva
//    @Scheduled(cron = "0 0 0 * * ?")
//    public void updateRequestStatuses() {
//        System.out.println("Update Requests Status");
//        List<GroupRequest> pendingRequests = jdbcTemplate.query(
//                "SELECT * FROM group_requests WHERE status = 'PENDING' AND request_date < ?",
//                new Object[]{LocalDate.now()},
//                new BeanPropertyRowMapper<>(GroupRequest.class)
//        );
//
//        for (GroupRequest request : pendingRequests) {
//            jdbcTemplate.update("UPDATE group_requests SET status = 'REJECTED' WHERE user_id = ? AND group_id = ?",
//                    request.getId().getUserId(), request.getId().getGroupId());
//            sendAutomatedMessage(request.getId().getUserId(), "Vaš zahtjev za grupu " + request.getId().getGroupId() + " je odbijen jer niste platili na vrijeme.");
//        }
//    }
//
//    // Metoda za slanje automatske poruke
//    private void sendAutomatedMessage(Long userId, String message) {
//        ChatMessage chatMessage = new ChatMessage();
//        chatMessage.setMessage_text(message);
//        messagingTemplate.convertAndSend("/queue/" + userId, chatMessage);
//    }
//
//    // Metoda za pronalazak zahtjeva prema ID-u
//    public GroupRequest findRequestById(GroupRequestId requestId) {
//        List<GroupRequest> results = jdbcTemplate.query(
//                "SELECT * FROM group_requests WHERE user_id = ? AND group_id = ?",
//                new Object[]{requestId.getUserId(), requestId.getGroupId()},
//                new BeanPropertyRowMapper<>(GroupRequest.class)
//        );
//        return results.isEmpty() ? null : results.get(0);
//    }
//
//    // Metoda za update statusa zahtjeva
//    public void updateRequestStatus(GroupRequest request, RequestStatus status) {
//        jdbcTemplate.update("UPDATE group_requests SET status = ? WHERE user_id = ? AND group_id = ?",
//                status.name(), request.getId().getUserId(), request.getId().getGroupId());
//
//        String statusMessage = "";
//        switch (status) {
//            case ACCEPTED:
//                statusMessage = "Vaš zahtjev za grupu " + request.getId().getGroupId() + " je prihvaćen.";
//                break;
//            case PENDING:
//                statusMessage = "Vaš zahtjev za grupu " + request.getId().getGroupId() + " je na čekanju.";
//                break;
//            case REJECTED:
//                statusMessage = "Vaš zahtjev za grupu " + request.getId().getGroupId() + " je odbijen.";
//                break;
//        }
//        sendAutomatedMessage(request.getId().getUserId(), statusMessage);
//    }
//
//    // Metoda za paginaciju zahtjeva
//    public Map<String, Object> getPaginatedRequests(int page, int size) {
//        int offset = page * size;
//        List<GroupRequest> requests = jdbcTemplate.query(
//                "SELECT * FROM group_requests LIMIT ? OFFSET ?",
//                new Object[]{size, offset},
//                new BeanPropertyRowMapper<>(GroupRequest.class)
//        );
//
//        int total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM group_requests", Integer.class);
//        Map<String, Object> result = new HashMap<>();
//        result.put("requests", requests);
//        result.put("totalPages", (int) Math.ceil((double) total / size));
//        return result;
//    }

    @Scheduled(cron = "0 0 0 * * ?")
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
            jdbcTemplate.update("UPDATE group_requests SET status = 'REJECTED' WHERE user_id = ? AND group_id = ?", request.getId().getUserId(), request.getId().getGroupId());
            sendAutomatedMessage(request.getId().getUserId(), "Vaš zahtjev za grupu " + request.getId().getGroupId() + " je odbijen jer niste platili na vrijeme.");
        }
    }

    private void sendAutomatedMessage(Long userId, String message) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setMessage_text(message);
        messagingTemplate.convertAndSend("/queue/" + userId, chatMessage);
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

    public void acceptRequest(Long groupId, Long userId) {
        jdbcTemplate.update("UPDATE group_requests SET status = 'PENDING' WHERE user_id = ? AND group_id = ?", userId, groupId);
        sendAutomatedMessage(userId, "Vaš zahtjev za grupu " + groupId + " je prihvaćen.");
    }

    public void approveRequest(Long groupId, Long userId) {
        int currentAccepted = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM group_requests WHERE group_id = ? AND status = 'ACCEPTED'",
                new Object[]{groupId},
                Integer.class
        );

        int maxStudents = jdbcTemplate.queryForObject(
                "SELECT max_students FROM group_table WHERE group_id = ?",
                new Object[]{groupId},
                Integer.class
        );

        if (currentAccepted >= maxStudents) {
            throw new RuntimeException("Nema dovoljno mjesta u grupi za prihvaćanje zahtjeva.");
        }

        jdbcTemplate.update("UPDATE group_requests SET status = 'ACCEPTED' WHERE user_id = ? AND group_id = ?", userId, groupId);
        sendAutomatedMessage(userId, "Vaš zahtjev za grupu " + groupId + " je odobren.");
    }

    public void rejectRequest(Long groupId, Long userId) {
        jdbcTemplate.update("UPDATE group_requests SET status = 'REJECTED' WHERE user_id = ? AND group_id = ?", userId, groupId);
        sendAutomatedMessage(userId, "Vaš zahtjev za grupu " + groupId + " je odbijen.");
    }
}