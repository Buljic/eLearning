package com.example.tutoring.Services;

import com.example.tutoring.Entities.Group;
import com.example.tutoring.Other.RequestStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class GroupService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Group findGroupById(Long groupId) {
        String sql = "SELECT * FROM group_table WHERE group_id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new Object[]{groupId}, new BeanPropertyRowMapper<>(Group.class));
        } catch (EmptyResultDataAccessException ignored) {
            return null;
        }
    }

    @Transactional
    public void requestAccess(Long groupId, Long userId) {
        Group group = findGroupById(groupId);
        if (group == null) {
            throw new NoSuchElementException("Grupa ne postoji.");
        }
        if (isUserInGroup(userId, groupId)) {
            throw new IllegalStateException("Vec ste clan ove grupe.");
        }

        String checkRequestSql = "SELECT COUNT(*) FROM group_requests WHERE group_id = ? AND user_id = ?";
        int count = jdbcTemplate.queryForObject(checkRequestSql, new Object[]{groupId, userId}, Integer.class);

        if (count > 0) {
            throw new IllegalStateException("Vec ste poslali zahtjev za ovu grupu.");
        }

        Date startDate = group.getStartDate();
        if (startDate != null && startDate.before(new Date())) {
            throw new IllegalStateException("Grupa je vec pocela, ne mozete se pridruziti.");
        }

        String insertRequestSql = "INSERT INTO group_requests (user_id, group_id, request_date, status) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(insertRequestSql, userId, groupId, LocalDate.now(), RequestStatus.REQUESTED.toString());
    }

    public boolean isUserInGroup(Long userId, Long groupId) {
        String sql = "SELECT COUNT(*) FROM user_group WHERE user_id = ? AND group_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, new Object[]{userId, groupId}, Integer.class);
        return count != null && count > 0;
    }

    public boolean isTutorPresentInGroup(Long groupId) {
        String sql = "SELECT COUNT(*) FROM user u " +
                "JOIN user_group ug ON u.id = ug.user_id " +
                "LEFT JOIN user_roles ur ON ur.user_id = u.id " +
                "WHERE ug.group_id = ? " +
                "AND (u.account_type IN ('PROFESOR', 'OBOJE') OR ur.role = 'PROFESOR')";
        Integer count = jdbcTemplate.queryForObject(sql, new Object[]{groupId}, Integer.class);
        return count != null && count > 0;
    }

    public boolean isTutorOwnerOfGroup(Long tutorId, Long groupId) {
        String sql = "SELECT COUNT(*) FROM group_table WHERE group_id = ? AND headtutor_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, new Object[]{groupId, tutorId}, Integer.class);
        return count != null && count > 0;
    }

    public List<String> getGroupMemberUsernames(Long groupId) {
        String sql = "SELECT DISTINCT u.username FROM user u " +
                "JOIN user_group ug ON ug.user_id = u.id " +
                "WHERE ug.group_id = ?";
        return jdbcTemplate.query(sql, new Object[]{groupId}, (rs, rowNum) -> rs.getString("username"));
    }
}
