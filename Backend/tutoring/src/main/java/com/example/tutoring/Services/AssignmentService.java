package com.example.tutoring.Services;

import com.example.tutoring.Entities.Assignment;
import com.example.tutoring.Entities.AssignmentSubmission;
import com.example.tutoring.Other.AssignmentMapper;
import com.example.tutoring.Other.AssignmentSubmissionMapper;
import com.example.tutoring.Other.AssignmentWithSubmissionsMapper;
import com.example.tutoring.Other.SubmissionStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
public class AssignmentService {
    private final JdbcTemplate jdbcTemplate;

    public AssignmentService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

//    public List<Assignment> getAssignmentsByGroupId(Long groupId) {
//        String sql = "SELECT * FROM assignment WHERE group_id = ? ORDER BY due_date_time DESC";
//        return jdbcTemplate.query(sql, new Object[]{groupId}, new AssignmentMapper());
//    }
//
//    public void saveAssignment(Assignment assignment) {
//        String sql = "INSERT INTO assignment (name, description, due_date_time, points, image_url, group_id) VALUES (?, ?, ?, ?, ?, ?)";
//        jdbcTemplate.update(sql, assignment.getName(), assignment.getDescription(), assignment.getDueDateTime(), assignment.getPoints(), assignment.getImageUrl(), assignment.getGroup().getGroup_id());
//    }
//
//    public void saveSubmission(AssignmentSubmission submission) {
//        String sql = "INSERT INTO assignment_submission (file_url, feedback, grade, assignment_id, user_id, submission_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
//        jdbcTemplate.update(sql, submission.getFileUrl(), submission.getFeedback(), submission.getGrade(), submission.getAssignment().getId(), submission.getStudent().getId(), submission.getSubmissionTime(), submission.getStatus().name());
//    }
//
//    public List<AssignmentSubmission> getSubmissionsByAssignmentId(Long assignmentId) {
//        String sql = "SELECT * FROM assignment_submission WHERE assignment_id = ?";
//        return jdbcTemplate.query(sql, new Object[]{assignmentId}, new AssignmentSubmissionMapper());
//    }
//
//    public void updateSubmission(AssignmentSubmission submission) {
//        String sql = "UPDATE assignment_submission SET feedback = ?, grade = ?, status = ? WHERE id = ?";
//        jdbcTemplate.update(sql, submission.getFeedback(), submission.getGrade(), submission.getStatus().name(), submission.getId());
//    }
//
//    public AssignmentSubmission getSubmissionById(Long submissionId) {
//        String sql = "SELECT * FROM assignment_submission WHERE id = ?";
//        return jdbcTemplate.queryForObject(sql, new Object[]{submissionId}, new AssignmentSubmissionMapper());
//    }
//
//    public Assignment getAssignmentById(Long assignmentId) {
//        String sql = "SELECT * FROM assignment WHERE id = ?";
//        return jdbcTemplate.queryForObject(sql, new Object[]{assignmentId}, new AssignmentMapper());
//    }
public List<Assignment> getAssignmentsByGroupId(Long groupId) {
    String sql = "SELECT * FROM assignment WHERE group_id = ? ORDER BY due_date_time DESC";
    return jdbcTemplate.query(sql, new Object[]{groupId}, new AssignmentMapper());
}

    public void saveAssignment(Assignment assignment) {
        String sql = "INSERT INTO assignment (name, description, due_date_time, points, image_url, group_id) VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, assignment.getName(), assignment.getDescription(), assignment.getDueDateTime(), assignment.getPoints(), assignment.getImageUrl(), assignment.getGroup().getGroup_id());
    }

//    public void saveSubmission(AssignmentSubmission submission) {
//        // Postavljanje statusa podneska na osnovu trenutnog vremena i vremena isteka zadatka
//        Assignment assignment = getAssignmentById(submission.getAssignment().getId());
//        if (new Date().after(Date.from(assignment.getDueDateTime().atZone(ZoneId.systemDefault()).toInstant()))) {
//            submission.setStatus(SubmissionStatus.LATE);
//        } else {
//            submission.setStatus(SubmissionStatus.SUBMITTED);
//        }
//
//        String sql = "INSERT INTO assignment_submission (file_url, feedback, grade, assignment_id, user_id, status, submission_time) VALUES (?, ?, ?, ?, ?, ?, ?)";
//        jdbcTemplate.update(sql, submission.getFileUrl(), submission.getFeedback(), submission.getGrade(), submission.getAssignment().getId(), submission.getStudent().getId(), submission.getStatus().name(), Timestamp.valueOf(submission.getSubmissionTime()));
//    }
public void saveSubmission(AssignmentSubmission submission) {
    // Postavljanje statusa podneska na osnovu trenutnog vremena i vremena isteka zadatka
    Assignment assignment = getAssignmentById(submission.getAssignment().getId());
    if (new Date().after(Date.from(assignment.getDueDateTime().atZone(ZoneId.systemDefault()).toInstant()))) {
        submission.setStatus(SubmissionStatus.LATE);
    } else {
        submission.setStatus(SubmissionStatus.SUBMITTED);
    }
    submission.setSubmissionTime(LocalDateTime.now());

    String sql = "INSERT INTO assignment_submission (file_url, feedback, grade, assignment_id, user_id, status, submission_time) VALUES (?, ?, ?, ?, ?, ?, ?)";
    jdbcTemplate.update(sql, submission.getFileUrl(), submission.getFeedback(), submission.getGrade(), submission.getAssignment().getId(), submission.getStudent().getId(), submission.getStatus().name(), Timestamp.valueOf(submission.getSubmissionTime()));
}

    public List<AssignmentSubmission> getSubmissionsByAssignmentId(Long assignmentId) {
        String sql = "SELECT asub.*, u.username FROM assignment_submission asub JOIN user u ON asub.user_id = u.id WHERE asub.assignment_id = ?";
        return jdbcTemplate.query(sql, new Object[]{assignmentId}, new AssignmentSubmissionMapper());
    }

    public void updateSubmission(AssignmentSubmission submission) {
        String sql = "UPDATE assignment_submission SET feedback = ?, grade = ? WHERE id = ?";
        jdbcTemplate.update(sql, submission.getFeedback(), submission.getGrade(), submission.getId());
    }

    public AssignmentSubmission getSubmissionById(Long submissionId) {
        String sql = "SELECT asub.*, u.username FROM assignment_submission asub JOIN user u ON asub.user_id = u.id WHERE asub.id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{submissionId}, new AssignmentSubmissionMapper());
    }

    public Assignment getAssignmentById(Long assignmentId) {
        String sql = "SELECT * FROM assignment WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{assignmentId}, new AssignmentMapper());
    }

//    public List<Assignment> getAssignmentsByGroupIdWithSubmissionsForUser(Long groupId, Long userId) {
//        String sql = "SELECT a.*, asub.* FROM assignment a " +
//                "LEFT JOIN assignment_submission asub ON a.id = asub.assignment_id AND asub.user_id = ? " +
//                "WHERE a.group_id = ? ORDER BY a.due_date_time DESC";
//        return jdbcTemplate.query(sql, new Object[]{userId, groupId}, new AssignmentWithSubmissionsMapper());
//    }
//
//
//    public Assignment getAssignmentWithSubmissions(Long assignmentId, Long userId) {
//        String sql = "SELECT a.*, asub.id AS asub_id, asub.feedback, asub.file_url, asub.grade, asub.status, asub.submission_time, asub.user_id " +
//                "FROM assignment a " +
//                "LEFT JOIN assignment_submission asub ON a.id = asub.assignment_id AND asub.user_id = ? " +
//                "WHERE a.id = ?";
//        return jdbcTemplate.queryForObject(sql, new Object[]{userId, assignmentId}, new AssignmentWithSubmissionsMapper());
//    }

    public List<Assignment> getAssignmentsByGroupIdWithSubmissionsForUser(Long groupId, Long userId) {
        String sql = "SELECT a.*, asub.id AS asub_id, asub.feedback, asub.file_url, asub.grade, asub.status, asub.submission_time, asub.user_id " +
                "FROM assignment a " +
                "LEFT JOIN assignment_submission asub ON a.id = asub.assignment_id AND asub.user_id = ? " +
                "WHERE a.group_id = ? ORDER BY a.due_date_time DESC";
        return jdbcTemplate.query(sql, new Object[]{userId, groupId}, new AssignmentWithSubmissionsMapper());
    }

    public Assignment getAssignmentWithSubmissions(Long assignmentId, Long userId) {
        String sql = "SELECT a.*, asub.id AS asub_id, asub.feedback, asub.file_url, asub.grade, asub.status, asub.submission_time, asub.user_id " +
                "FROM assignment a " +
                "LEFT JOIN assignment_submission asub ON a.id = asub.assignment_id AND asub.user_id = ? " +
                "WHERE a.id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{userId, assignmentId}, new AssignmentWithSubmissionsMapper());
    }
}
