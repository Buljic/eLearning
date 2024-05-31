package com.example.tutoring.Other;

import com.example.tutoring.Entities.Assignment;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class AssignmentMapper implements RowMapper<Assignment> {
    @Override
    public Assignment mapRow(ResultSet rs, int rowNum) throws SQLException {
        Assignment assignment = new Assignment();
        assignment.setId(rs.getLong("id"));
        assignment.setName(rs.getString("name"));
        assignment.setDescription(rs.getString("description"));
        assignment.setDueDate(rs.getDate("due_date").toLocalDate());
        assignment.setPoints(rs.getInt("points"));
        assignment.setImageUrl(rs.getString("image_url"));
        return assignment;
    }
}

