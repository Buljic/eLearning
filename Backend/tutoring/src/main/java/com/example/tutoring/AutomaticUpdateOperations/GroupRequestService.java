package com.example.tutoring.AutomaticUpdateOperations;

import com.example.tutoring.Entities.Embeddeds.GroupRequestId;
import com.example.tutoring.Entities.GroupRequest;
import com.example.tutoring.Other.RequestStatus;
import com.example.tutoring.WebSocket.ChatMessage;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class GroupRequestService {
    private final JdbcTemplate jdbcTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public GroupRequestService(JdbcTemplate jdbcTemplate, SimpMessagingTemplate messagingTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.messagingTemplate = messagingTemplate;
    }
    // Metoda za provjeru i update statusa zahtjeva
    @Scheduled(cron = "0 0 0 * * ?") // Ova linija ce se komentirati/odkomentirati prema potrebi
    public void updateRequestStatuses() {
        // Dohvacanje svih zahtjeva koji su u statusu 'PENDING' i ciji je datum pocetka manji od danasnjeg datuma
        System.out.println("Update Requests Status");
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
        // Update statusa za svaki zahtjev
        for (GroupRequest request : pendingRequests) {
            jdbcTemplate.update("UPDATE group_requests SET status = 'REJECTED' WHERE user_id = ? AND group_id = ?", request.getId().getUserId(), request.getId().getGroupId());
            sendAutomatedMessage(request.getId().getUserId(), "Vaš zahtjev za grupu " + request.getId().getGroupId() + " je odbijen jer niste platili na vrijeme.");
        }
    }
    // Metoda za slanje automatske poruke
    private void sendAutomatedMessage(Long userId, String message) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setMessage_text(message);
        messagingTemplate.convertAndSend("/queue/" + userId, chatMessage);
    }

    // Metoda za pronalazak zahtjeva prema ID-u
    public GroupRequest findRequestById(GroupRequestId requestId) {
        List<GroupRequest> results = jdbcTemplate.query(
                "SELECT * FROM group_requests WHERE user_id = ? AND group_id = ?",
                new Object[]{requestId.getUserId(), requestId.getGroupId()},
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
        return results.isEmpty() ? null : results.get(0);
    }

    // Metoda za update statusa zahtjeva
    public void updateRequestStatus(GroupRequest request, RequestStatus status) {
        jdbcTemplate.update("UPDATE group_requests SET status = ? WHERE user_id = ? AND group_id = ?",
                status.name(), request.getId().getUserId(), request.getId().getGroupId());

        String statusMessage = "";
        switch (status) {
            case ACCEPTED:
                statusMessage = "Vaš zahtjev za grupu " + request.getId().getGroupId() + " je prihvaćen.";
                break;
            case PENDING:
                statusMessage = "Vaš zahtjev za grupu " + request.getId().getGroupId() + " je na čekanju.";
                break;
            case REJECTED:
                statusMessage = "Vaš zahtjev za grupu " + request.getId().getGroupId() + " je odbijen.";
                break;
        }
        sendAutomatedMessage(request.getId().getUserId(), statusMessage);
    }
}