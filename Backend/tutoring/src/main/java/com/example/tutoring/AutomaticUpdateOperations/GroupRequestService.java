package com.example.tutoring.AutomaticUpdateOperations;

import com.example.tutoring.Entities.Embeddeds.GroupRequestId;
import com.example.tutoring.Entities.GroupRequest;
import com.example.tutoring.Other.RequestStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class GroupRequestService {
    private final JdbcTemplate jdbcTemplate;

    public GroupRequestService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Metoda za provjeru i update statusa zahtjeva
    @Scheduled(cron = "0 0 0 * * ?") // Ova linija ce se komentirati/odkomentirati prema potrebi
    public void updateRequestStatuses() {
        // Dohvacanje svih zahtjeva koji su u statusu 'PENDING' i ciji je datum pocetka manji od danasnjeg datuma
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
        //TODO dodaj ovdje za slanje poruka poslije
    }
}

