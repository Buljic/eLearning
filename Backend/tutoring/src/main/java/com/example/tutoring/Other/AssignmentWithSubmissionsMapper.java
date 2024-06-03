package com.example.tutoring.Other;

import com.example.tutoring.Entities.Assignment;
import com.example.tutoring.Entities.AssignmentSubmission;
import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.User;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class AssignmentWithSubmissionsMapper implements RowMapper<Assignment>
{

    @Override
    public Assignment mapRow(ResultSet rs, int rowNum) throws SQLException
    {
        Assignment assignment = new Assignment();
        assignment.setId(rs.getLong("id"));
        assignment.setName(rs.getString("name"));
        assignment.setDescription(rs.getString("description"));
        assignment.setDueDateTime(rs.getTimestamp("due_date_time").toLocalDateTime());
        assignment.setPoints(rs.getInt("points"));
        assignment.setImageUrl(rs.getString("image_url"));

        Group group = new Group();
        group.setGroup_id(rs.getLong("group_id"));
        assignment.setGroup(group);

        List<AssignmentSubmission> submissions = new ArrayList<>();
        if (rs.getLong("asub.id") != 0) {
            AssignmentSubmission submission = new AssignmentSubmission();
            submission.setId(rs.getLong("asub.id"));
            submission.setFeedback(rs.getString("feedback"));
            submission.setFileUrl(rs.getString("file_url"));
            submission.setGrade(rs.getInt("grade"));
            submission.setStatus(SubmissionStatus.valueOf(rs.getString("status")));
            submission.setSubmissionTime(rs.getTimestamp("submission_time").toLocalDateTime());

            User student = new User();
            student.setId(rs.getLong("user_id"));
            submission.setStudent(student);

            submissions.add(submission);
        }
        assignment.setSubmissions(submissions);

        return assignment;
    }
}

