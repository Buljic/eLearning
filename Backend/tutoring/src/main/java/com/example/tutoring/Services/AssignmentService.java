package com.example.tutoring.Services;

import com.example.tutoring.Entities.Assignment;
import com.example.tutoring.Entities.AssignmentSubmission;
import com.example.tutoring.Other.AssignmentMapper;
import com.example.tutoring.Other.AssignmentSubmissionMapper;
import com.example.tutoring.Other.SubmissionStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {
    private final JdbcTemplate jdbcTemplate;

    public AssignmentService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Assignment> getAssignmentsByGroupId(Long groupId) {
        String sql = "SELECT * FROM assignment WHERE group_id = ? ORDER BY due_date_time DESC";
        return jdbcTemplate.query(sql, new Object[]{groupId}, new AssignmentMapper());
    }

    public void saveAssignment(Assignment assignment) {
        String sql = "INSERT INTO assignment (name, description, due_date_time, points, image_url, group_id) VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, assignment.getName(), assignment.getDescription(), assignment.getDueDateTime(), assignment.getPoints(), assignment.getImageUrl(), assignment.getGroup().getGroup_id());
    }

    public void saveSubmission(AssignmentSubmission submission) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueDateTime = submission.getAssignment().getDueDateTime();

        if (now.isBefore(dueDateTime) || now.isEqual(dueDateTime)) {
            submission.setStatus(SubmissionStatus.SUBMITTED);
        } else {
            submission.setStatus(SubmissionStatus.LATE);
        }

        submission.setSubmissionTime(now);

        String sql = "INSERT INTO assignment_submissions (file_url, feedback, grade, assignment_id, user_id, status, submission_time) VALUES (?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, submission.getFileUrl(), submission.getFeedback(), submission.getGrade(), submission.getAssignment().getId(), submission.getStudent().getId(), submission.getStatus().name(), submission.getSubmissionTime());
    }

    public List<AssignmentSubmission> getSubmissionsByAssignmentId(Long assignmentId) {
        String sql = "SELECT * FROM assignment_submissions WHERE assignment_id = ?";
        return jdbcTemplate.query(sql, new Object[]{assignmentId}, new AssignmentSubmissionMapper());
    }

    public void updateSubmission(AssignmentSubmission submission) {
        String sql = "UPDATE assignment_submissions SET feedback = ?, grade = ?, status = ?, submission_time = ? WHERE id = ?";
        jdbcTemplate.update(sql, submission.getFeedback(), submission.getGrade(), submission.getStatus().name(), submission.getSubmissionTime(), submission.getId());
    }

    public AssignmentSubmission getSubmissionById(Long submissionId) {
        String sql = "SELECT * FROM assignment_submissions WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{submissionId}, new AssignmentSubmissionMapper());
    }
}
