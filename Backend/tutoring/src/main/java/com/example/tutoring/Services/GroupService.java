package com.example.tutoring.Services;

import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;

@Service
public class GroupService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Group findGroupById(Long groupId) {
        String sql = "SELECT * FROM group_table WHERE group_id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{groupId}, new BeanPropertyRowMapper<>(Group.class));
    }

    public void requestAccess(Group group, User user) {
        if (group.getStartDate().before(new Date())) {
            throw new IllegalArgumentException("Cannot request access to past groups");
        }
        String sql = "INSERT INTO user_group (group_id, user_id, date_joined, status) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, group.getGroup_id(), user.getId(), new Date(), "requested");
    }
}
