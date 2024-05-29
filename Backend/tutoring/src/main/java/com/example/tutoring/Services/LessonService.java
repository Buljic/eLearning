package com.example.tutoring.Services;

import com.example.tutoring.Entities.Lesson;
import com.example.tutoring.Entities.Material;
import com.example.tutoring.Other.LessonMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

@Service
public class LessonService {
    private final JdbcTemplate jdbcTemplate;
    private final String uploadDir = "uploads/";

    public LessonService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Lesson> getLessonsByGroupId(Long groupId) {
        String sql = "SELECT * FROM lessons WHERE group_id = ?";
        return jdbcTemplate.query(sql, new Object[]{groupId}, new LessonMapper());
    }

    public Lesson createLesson(Lesson lesson, MultipartFile[] files) {
        String sql = "INSERT INTO lessons (group_id, title, content, created_at) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, lesson.getGroup().getGroup_id(), lesson.getTitle(), lesson.getContent(), lesson.getCreatedAt());

        Long lessonId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        lesson.setId(lessonId);

        saveFiles(lesson, files);

        return lesson;
    }

    private void saveFiles(Lesson lesson, MultipartFile[] files) {
        List<String> fileNames = new ArrayList<>();
        for (MultipartFile file : files) {
            String fileName = file.getOriginalFilename();
            try {
                File dest = new File(uploadDir + fileName);
                file.transferTo(dest);
                fileNames.add(fileName);

                String sql = "INSERT INTO lesson_files (lesson_id, file_name) VALUES (?, ?)";
                jdbcTemplate.update(sql, lesson.getId(), fileName);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        lesson.setFileNames(fileNames);
    }


    public Material uploadFile(MultipartFile file, Long lessonId) throws Exception {
        Path uploadPath = Paths.get("uploads/");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Material material = new Material();
        material.setFileName(fileName);
        material.setFileType(file.getContentType());
        material.setFileUrl(filePath.toString());
        material.setLesson(new Lesson(lessonId));
        saveMaterial(material);

        return material;
    }
}
