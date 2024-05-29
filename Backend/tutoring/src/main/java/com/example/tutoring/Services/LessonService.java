package com.example.tutoring.Services;

import com.example.tutoring.Entities.Lesson;
import com.example.tutoring.Entities.Material;
import com.example.tutoring.Other.LessonMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonService {
    private final JdbcTemplate jdbcTemplate;

    public LessonService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Lesson> getLessonsByGroupId(Long groupId) {
        String sql = "SELECT * FROM lessons WHERE group_id = ?";
        return jdbcTemplate.query(sql, new Object[]{groupId}, new LessonMapper());
    }

    public Lesson createLesson(Lesson lesson) {
        String sql = "INSERT INTO lessons (group_id, title, content, created_at) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, lesson.getGroup().getGroup_id(), lesson.getTitle(), lesson.getContent(), lesson.getCreatedAt());
        return lesson;
    }

    public Material saveMaterial(Material material) {
        String sql = "INSERT INTO materials (lesson_id, file_name, file_type, file_url) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, material.getLesson().getId(), material.getFileName(), material.getFileType(), material.getFileUrl());
        return material;
    }
}
