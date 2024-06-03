package com.example.tutoring.Other;

import com.example.tutoring.Entities.Assignment;
import com.example.tutoring.Entities.AssignmentSubmission;
import com.example.tutoring.Entities.User;
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
        submission.setStatus(SubmissionStatus.valueOf(rs.getString("status")));
        submission.setSubmissionTime(rs.getTimestamp("submission_time").toLocalDateTime());

        Assignment assignment = new Assignment();
        assignment.setId(rs.getLong("assignment_id"));
        submission.setAssignment(assignment);

        User student = new User();
        student.setId(rs.getLong("user_id"));
        student.setUsername(rs.getString("username"));
        submission.setStudent(student);

        return submission;
    }
}
