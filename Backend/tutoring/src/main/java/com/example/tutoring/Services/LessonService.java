package com.example.tutoring.Services;

import com.example.tutoring.Entities.Lesson;
import com.example.tutoring.Entities.Material;
import com.example.tutoring.Other.LessonMapper;
import com.example.tutoring.Other.MaterialMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonService {
    private static final Logger logger = LoggerFactory.getLogger(LessonService.class);
    private final JdbcTemplate jdbcTemplate;

    public LessonService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Lesson> getLessonsByGroupId(Long groupId) {
        String sql = "SELECT * FROM lessons WHERE group_id = ? ORDER BY created_at DESC";
        List<Lesson> lessons = jdbcTemplate.query(sql, new Object[]{groupId}, new LessonMapper());

        for (Lesson lesson : lessons) {
            List<Material> materials = getMaterialsByLessonId(lesson.getId());
            lesson.setMaterials(materials);
        }

        return lessons;
    }

    public List<Material> getMaterialsByLessonId(Long lessonId) {
        String sql = "SELECT * FROM materials WHERE lesson_id = ?";
        return jdbcTemplate.query(sql, new Object[]{lessonId}, new MaterialMapper());
    }

    public Long getGroupIdByLessonId(Long lessonId) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT group_id FROM lessons WHERE id = ?",
                    new Object[]{lessonId},
                    Long.class
            );
        } catch (EmptyResultDataAccessException ignored) {
            return null;
        }
    }

    public void saveLesson(Lesson lesson) {
        String sql = "INSERT INTO lessons (group_id, title, content, created_at) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, lesson.getGroup().getGroup_id(), lesson.getTitle(), lesson.getContent(), lesson.getCreatedAt());
        Long lessonId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        lesson.setId(lessonId);
        logger.debug("Saved lesson with ID={}", lessonId);
    }

    public void saveMaterial(Material material) {
        String fileName = material.getFileName();
        String relativePath = "/uploads/" + fileName;
        material.setFileUrl(relativePath); //Relativni path

        String sql = "INSERT INTO materials (lesson_id, file_name, file_type, file_url) VALUES (?, ?, ?, ?)";
        logger.debug("Saving material for lessonId={}", material.getLesson().getId());
        jdbcTemplate.update(sql, material.getLesson().getId(), material.getFileName(), material.getFileType(), material.getFileUrl());
    }
}
