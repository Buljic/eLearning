package com.example.tutoring.Other;

import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.Lesson;
import org.springframework.jdbc.core.RowMapper;


import java.sql.ResultSet;
import java.sql.SQLException;

public class LessonMapper implements RowMapper<Lesson>
{
    @Override
    public Lesson mapRow(ResultSet rs, int rowNum) throws SQLException
    {
        Lesson lesson = new Lesson();
        lesson.setId(rs.getLong("id"));
        lesson.setTitle(rs.getString("title"));
        lesson.setContent(rs.getString("content"));
        lesson.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        Group group = new Group();
        group.setGroup_id(rs.getLong("group_id"));
        lesson.setGroup(group);

        return lesson;
    }
}

