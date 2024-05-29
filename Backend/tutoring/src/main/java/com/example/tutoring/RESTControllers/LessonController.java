package com.example.tutoring.RESTControllers;

import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.Lesson;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.LessonService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping ("/{groupId}/lessons")
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

    @PostMapping ("/{groupId}/lessons")
    public ResponseEntity<?> createLesson(@PathVariable Long groupId, @RequestBody Lesson lesson, HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null) {
            String role = jwtUtil.getRoleFromToken(token);
            if (!role.equals("PROFESOR")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        lesson.setGroup(new Group(groupId));
        Lesson createdLesson = lessonService.createLesson(lesson);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLesson);
    }
}

