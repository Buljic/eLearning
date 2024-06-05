package com.example.tutoring.Services;

import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.RequestStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class GroupService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Group findGroupById(Long groupId) {
        String sql = "SELECT * FROM group_table WHERE group_id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{groupId}, new BeanPropertyRowMapper<>(Group.class));
    }

    @Transactional
    public void requestAccess(Long groupId, Long userId) throws Exception {
        // Provjera da li korisnik vec ima zahtjev za istu grupu
        String checkRequestSql = "SELECT COUNT(*) FROM group_requests WHERE group_id = ? AND user_id = ?";
        int count = jdbcTemplate.queryForObject(checkRequestSql, new Object[]{groupId, userId}, Integer.class);

        if (count > 0) {
            throw new Exception("Već ste poslali zahtjev za ovu grupu.");
        }

        // Provjera da li je grupa vec pocela
        String checkGroupStartSql = "SELECT start_date FROM group_table WHERE group_id = ?";
        Date startDate = jdbcTemplate.queryForObject(checkGroupStartSql, new Object[]{groupId}, Date.class);

        if (startDate != null && startDate.before(new Date())) {
            throw new Exception("Grupa je već počela, ne možete se pridružiti.");
        }

        // Dodavanje zahtjeva
        String insertRequestSql = "INSERT INTO group_requests (user_id, group_id, request_date, status) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(insertRequestSql, userId, groupId, LocalDate.now(), RequestStatus.REQUESTED.toString());
    }

    public boolean isUserInGroup(Long userId, Long groupId) {
        String sql = "SELECT COUNT(*) FROM user_group WHERE user_id = ? AND group_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, new Object[]{userId, groupId}, Integer.class);
        return count != null && count > 0;
    }

    public boolean isTutorPresentInGroup(Long groupId) {
        String sql = "SELECT u.id, u.account_type FROM user u " +
                "JOIN user_group ug ON u.id = ug.user_id " +
                "WHERE ug.group_id = ?";

        List<Map<String, Object>> users = jdbcTemplate.queryForList(sql, groupId);

        return users.stream().anyMatch(user -> "PROFESOR".equals(user.get("account_type")));
    }
}
