package com.example.tutoring.AutomaticUpdateOperations;

import com.example.tutoring.Entities.GroupRequest;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Profile("!test")
public class StartupApplicationListener {

    private final GroupRequestService groupRequestService;
    private final JdbcTemplate jdbcTemplate;

    public StartupApplicationListener(GroupRequestService groupRequestService, JdbcTemplate jdbcTemplate) {
        this.groupRequestService = groupRequestService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void onStartup() {
        groupRequestService.updateRequestStatuses();
        addUsersToGroups();
    }

    @Scheduled (cron = "0 0 1 * * ?")
    public void addUsersToGroups() {
        List<GroupRequest> acceptedRequests = groupRequestService.getAcceptedGroupRequests();
        for (GroupRequest request : acceptedRequests) {
            Long userId = request.getId().getUserId();
            Long groupId = request.getId().getGroupId();
            LocalDate currentDate = LocalDate.now();


            String checkSql = "SELECT COUNT(*) FROM user_group WHERE user_id = ? AND group_id = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, new Object[]{userId, groupId}, Integer.class);

            if (count == 0) {

                String insertSql = "INSERT INTO user_group (user_id, group_id, date_joined) VALUES (?, ?, ?)";
                jdbcTemplate.update(insertSql, userId, groupId, currentDate);
            }
        }
    }
}
