package com.example.tutoring.RESTControllers;

import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.Lesson;
import com.example.tutoring.Entities.Material;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Services.LessonService;

import com.example.tutoring.Services.StorageService;
import com.example.tutoring.Services.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
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
    private final StorageService storageService;
    private final GroupService groupService;
    private final UserService userService;
    private final ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(LessonController.class);

    @Value ("${file.upload-dir}")
    private String uploadDir;

    public LessonController(
            LessonService lessonService,
            JwtUtil jwtUtil,
            StorageService storageService,
            GroupService groupService,
            UserService userService,
            ObjectMapper objectMapper
    ) {
        this.lessonService = lessonService;
        this.jwtUtil = jwtUtil;
        this.storageService = storageService;
        this.groupService = groupService;
        this.userService = userService;
        this.objectMapper = objectMapper;
    }

//    @PostMapping("/lessons")
//    public ResponseEntity<?> createLesson(@RequestBody Lesson lesson) {
//        lessonService.saveLesson(lesson);
//        return ResponseEntity.status(HttpStatus.CREATED).body("Lesson created successfully");
//    }
//
//    @GetMapping("/{groupId}/lessons")
//    public ResponseEntity<List<Lesson>> getLessons(@PathVariable Long groupId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
//        List<Lesson> lessons = lessonService.getLessonsByGroupId(groupId, page, size);
//        return ResponseEntity.ok(lessons);
//    }
//
//    @PostMapping("/lessons/{lessonId}/upload")
//    public ResponseEntity<?> uploadMaterial(@PathVariable Long lessonId, @RequestParam("file") MultipartFile file) {
//        String fileName = file.getOriginalFilename();
//        try {
//            File dest = new File(uploadDir + File.separator + fileName);
//            file.transferTo(dest);
//            Material material = new Material();
//            material.setLesson(new Lesson(lessonId));
//            material.setFileName(fileName);
//            material.setFileType(file.getContentType());
//            material.setFileUrl(dest.getAbsolutePath());
//            lessonService.saveMaterial(material);
//            return ResponseEntity.status(HttpStatus.CREATED).body("File uploaded successfully");
//        } catch (IOException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
//        }
//    }
//
//    @GetMapping("/uploads/{filename:.+}")
//    @ResponseBody
//    public ResponseEntity<Resource> getFile(@PathVariable String filename) throws MalformedURLException
//    {
//        Path file = Paths.get("uploads/").resolve(filename);
//        Resource resource = new UrlResource(file.toUri());
//
//        if (!resource.exists() || !resource.isReadable()) {
//            throw new RuntimeException("Could not read the file!");
//        }
//
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
//                .body(resource);
//    }

//    @PostMapping("/lessons")
//    public ResponseEntity<?> createLessonWithFiles(HttpServletRequest request, @RequestPart("lesson") Lesson lesson, @RequestPart("files") MultipartFile[] files) {
//        String token = jwtUtil.extractJwtFromCookie(request);
//        if (token != null) {
//            String role = jwtUtil.getRoleFromToken(token);
//            if (role.equals("PROFESOR")) {
//                lessonService.saveLesson(lesson);
//                for (MultipartFile file : files) {
//                    try {
//                        String fileName = file.getOriginalFilename();
//                        File dest = new File(uploadDir + File.separator + fileName);
//                        file.transferTo(dest);
//                        Material material = new Material();
//                        material.setLesson(lesson);
//                        material.setFileName(fileName);
//                        material.setFileType(file.getContentType());
//                        material.setFileUrl(dest.getAbsolutePath());
//                        lessonService.saveMaterial(material);
//                    } catch (IOException e) {
//                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
//                    }
//                }
//                return ResponseEntity.status(HttpStatus.CREATED).body("Lesson created successfully with files");
//            } else {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only professors can create lessons");
//            }
//        } else {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
//        }
//    }
//
//    @GetMapping("/{groupId}/lessons")
//    public ResponseEntity<List<Lesson>> getLessons(@PathVariable Long groupId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
//        List<Lesson> lessons = lessonService.getLessonsByGroupId(groupId, page, size);
//        return ResponseEntity.ok(lessons);
//    }
//
//    @PostMapping("/lessons/{lessonId}/upload")
//    public ResponseEntity<?> uploadMaterial(@PathVariable Long lessonId, @RequestParam("file") MultipartFile file) {
//        String fileName = file.getOriginalFilename();
//        try {
//            File dest = new File(uploadDir + File.separator + fileName);
//            file.transferTo(dest);
//            Material material = new Material();
//            material.setLesson(new Lesson(lessonId));
//            material.setFileName(fileName);
//            material.setFileType(file.getContentType());
//            material.setFileUrl(dest.getAbsolutePath());
//            lessonService.saveMaterial(material);
//            return ResponseEntity.status(HttpStatus.CREATED).body("File uploaded successfully");
//        } catch (IOException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
//        }
//    }

    @PostMapping(value = "/lessons", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createLessonWithFiles(HttpServletRequest request, @RequestPart("lesson") String lessonData, @RequestPart("files") MultipartFile[] files) throws JsonProcessingException {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!canActAsProfessor(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only professors can create lessons");
        }

        Lesson lesson;
        try {
            lesson = objectMapper.readValue(lessonData, Lesson.class);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to parse lesson data: " + e.getMessage());
        }

        if (lesson.getGroup() == null || lesson.getGroup().getGroup_id() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lesson must be attached to a group");
        }
        if (!groupService.isTutorOwnerOfGroup(currentUser.getId(), lesson.getGroup().getGroup_id())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can create lessons only for your own groups");
        }

        try {
            lessonService.saveLesson(lesson);
            Long lessonId = lesson.getId();
            if (lessonId == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save lesson");
            }

            MultipartFile[] safeFiles = files == null ? new MultipartFile[0] : files;
            for (MultipartFile file : safeFiles) {
                if (file == null || file.isEmpty()) {
                    continue;
                }
                String fileName = storageService.store(file);
                Material material = new Material();
                Lesson savedLesson = new Lesson();
                savedLesson.setId(lessonId);
                material.setLesson(savedLesson);
                material.setFileName(fileName);
                material.setFileType(file.getContentType());
                material.setFileUrl("/uploads/" + fileName);
                lessonService.saveMaterial(material);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body("Lesson created successfully with files");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    @GetMapping("/{groupId}/lessons")
    public ResponseEntity<?> getLessons(@PathVariable Long groupId, HttpServletRequest request) {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!canAccessGroup(currentUser, groupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        List<Lesson> lessons = lessonService.getLessonsByGroupId(groupId);
        for (Lesson lesson : lessons) {
            List<Material> materials = lessonService.getMaterialsByLessonId(lesson.getId());
            lesson.setMaterials(materials);
            logger.info("Lesson: " + lesson.getTitle() + " has materials: " + materials);
        }
        logger.info("Fetched lessons for group " + groupId + ": " + lessons);
        return ResponseEntity.ok(lessons);
    }

    @PostMapping("/lessons/{lessonId}/upload")
    public ResponseEntity<?> uploadMaterial(@PathVariable Long lessonId, @RequestParam("file") MultipartFile file, HttpServletRequest request) {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!canActAsProfessor(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only professors can upload lesson materials");
        }

        Long groupId = lessonService.getGroupIdByLessonId(lessonId);
        if (groupId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Lesson not found");
        }
        if (!groupService.isTutorOwnerOfGroup(currentUser.getId(), groupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot upload materials outside your groups");
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is required");
        }
        try {
            // Logiranje direktorija i imena fajlova
            logger.info("Upload directory: " + uploadDir);

            String storedFileName = storageService.store(file);
            Material material = new Material();
            Lesson lesson = new Lesson();
            lesson.setId(lessonId);
            material.setLesson(lesson);  // Ispravno postavljanje lessonId
            material.setFileName(storedFileName);
            material.setFileType(file.getContentType());
            material.setFileUrl("/uploads/" + storedFileName); // Postavljanje relativne putanje
            lessonService.saveMaterial(material);
            logger.info("Saving material with lessonId: " + material.getLesson().getId());
            return ResponseEntity.status(HttpStatus.CREATED).body("File uploaded successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file.");
        }
    }

    private User authenticate(HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return null;
        }
        String username = jwtUtil.getUsernameFromToken(token);
        try {
            return userService.getUserByUsername(username);
        } catch (Exception ignored) {
            return null;
        }
    }

    private boolean canAccessGroup(User user, Long groupId) {
        if (groupService.isUserInGroup(user.getId(), groupId)) {
            return true;
        }
        return canActAsProfessor(user) && groupService.isTutorOwnerOfGroup(user.getId(), groupId);
    }

    private boolean canActAsProfessor(User user) {
        return user.hasRole(AccountType.PROFESOR) || user.hasRole(AccountType.ADMIN);
    }
}

