package com.example.tutoring.Other;

import com.example.tutoring.Entities.AssignmentSubmission;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class AssignmentSubmissionMapper implements RowMapper<AssignmentSubmission> {
    @Override
    public AssignmentSubmission mapRow(ResultSet rs, int rowNum) throws SQLException {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setId(rs.getLong("id"));
        submission.setFileUrl(rs.getString("file_url"));
        submission.setFeedback(rs.getString("feedback"));
        submission.setGrade(rs.getInt("grade"));
        return submission;
    }
}

