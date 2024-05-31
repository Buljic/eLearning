package com.example.tutoring.Services;

import com.example.tutoring.Entities.Assignment;
import com.example.tutoring.Entities.AssignmentSubmission;
import com.example.tutoring.Other.AssignmentMapper;
import com.example.tutoring.Other.AssignmentSubmissionMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssignmentService {
    private final JdbcTemplate jdbcTemplate;

    public AssignmentService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Assignment> getAssignmentsByGroupId(Long groupId) {
        String sql = "SELECT * FROM assignments WHERE group_id = ? ORDER BY due_date DESC";
        return jdbcTemplate.query(sql, new Object[]{groupId}, new AssignmentMapper());
    }

    public void saveAssignment(Assignment assignment) {
        String sql = "INSERT INTO assignments (name, description, due_date, points, image_url, group_id) VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, assignment.getName(), assignment.getDescription(), assignment.getDueDate(), assignment.getPoints(), assignment.getImageUrl(), assignment.getGroup().getId());
    }

    public void saveSubmission(AssignmentSubmission submission) {
        String sql = "INSERT INTO assignment_submissions (file_url, feedback, grade, assignment_id, user_id) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, submission.getFileUrl(), submission.getFeedback(), submission.getGrade(), submission.getAssignment().getId(), submission.getStudent().getId());
    }

    public List<AssignmentSubmission> getSubmissionsByAssignmentId(Long assignmentId) {
        String sql = "SELECT * FROM assignment_submissions WHERE assignment_id = ?";
        return jdbcTemplate.query(sql, new Object[]{assignmentId}, new AssignmentSubmissionMapper());
    }

    public void updateSubmission(AssignmentSubmission submission) {
        String sql = "UPDATE assignment_submissions SET feedback = ?, grade = ? WHERE id = ?";
        jdbcTemplate.update(sql, submission.getFeedback(), submission.getGrade(), submission.getId());
    }
}
