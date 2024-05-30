package com.example.tutoring.Other;

import com.example.tutoring.Entities.Lesson;
import com.example.tutoring.Entities.Material;
import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;

public class MaterialMapper implements RowMapper<Material> {
    @Override
    public Material mapRow(ResultSet rs, int rowNum) throws SQLException {
//        Material material = new Material();
//        material.setId(rs.getLong("id"));
//        material.setFileName(rs.getString("file_name"));
//        material.setFileType(rs.getString("file_type"));
//        material.setFileUrl(rs.getString("file_url"));
//        material.setLesson(new Lesson(rs.getLong("lesson_id")));
//        return material;
        Material material = new Material();
        material.setId(rs.getLong("id"));
        material.setFileName(rs.getString("file_name"));
        material.setFileType(rs.getString("file_type"));
        material.setFileUrl(rs.getString("file_url"));

        Lesson lesson = new Lesson();
        lesson.setId(rs.getLong("lesson_id"));
        material.setLesson(lesson);

        return material;
    }
}

