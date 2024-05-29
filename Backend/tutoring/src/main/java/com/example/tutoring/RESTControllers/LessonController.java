package com.example.tutoring.RESTControllers;

import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.Lesson;
import com.example.tutoring.Entities.Material;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.LessonService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping ("/api")
public class LessonController {
    private final LessonService lessonService;
    private final JwtUtil jwtUtil;

    public LessonController(LessonService lessonService, JwtUtil jwtUtil) {
        this.lessonService = lessonService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/{groupId}/lessons")
    public ResponseEntity<?> createLesson(@PathVariable Long groupId, @RequestParam("title") String title,
                                          @RequestParam("content") String content, @RequestParam("files") MultipartFile[] files,
                                          HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null) {
            String role = jwtUtil.getRoleFromToken(token);
            if (!role.equals("PROFESOR")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setGroup(new Group(groupId));  // Assuming Group constructor with ID
        lesson.setCreatedAt(LocalDateTime.now());

        Lesson createdLesson = lessonService.createLesson(lesson, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLesson);
    }

    @GetMapping("/{groupId}/lessons")
    public ResponseEntity<?> getLessonsByGroupId(@PathVariable Long groupId, HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null) {
            String role = jwtUtil.getRoleFromToken(token);
            if (!role.equals("STUDENT") && !role.equals("PROFESOR")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        List<Lesson> lessons = lessonService.getLessonsByGroupId(groupId);
        return ResponseEntity.ok(lessons);
    }

    @PostMapping("/lessons/{lessonId}/upload")
    public ResponseEntity<?> uploadFile(@PathVariable Long lessonId, @RequestParam("file") MultipartFile file, HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null) {
            String role = jwtUtil.getRoleFromToken(token);
            if (!role.equals("PROFESOR")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        try {
            Material material = lessonService.uploadFile(file, lessonId);
            return ResponseEntity.status(HttpStatus.CREATED).body(material);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }

    @GetMapping("/uploads/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> getFile(@PathVariable String filename) throws MalformedURLException
    {
        Path file = Paths.get("uploads/").resolve(filename);
        Resource resource = new UrlResource(file.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("Could not read the file!");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

}

