package com.example.tutoring.RESTControllers;


import com.example.tutoring.DTOs.AssignmentRequest;
import com.example.tutoring.Entities.Assignment;
import com.example.tutoring.Entities.AssignmentSubmission;
import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.AssignmentService;
import com.example.tutoring.Services.StorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidDefinitionException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AssignmentController {
    private final AssignmentService assignmentService;
    private final JwtUtil jwtUtil;
    private final StorageService storageService;
    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    public AssignmentController(AssignmentService assignmentService, JwtUtil jwtUtil, StorageService storageService, ObjectMapper objectMapper) {
        this.assignmentService = assignmentService;
        this.jwtUtil = jwtUtil;
        this.storageService = storageService;
        this.objectMapper = objectMapper;
    }

    @PostMapping(value = "/assignments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAssignment(HttpServletRequest request, @RequestPart("assignment") String assignmentData, @RequestPart("file") MultipartFile file) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null) {
            String role = jwtUtil.getRoleFromToken(token);
            if (role.equals("PROFESOR")) {
                AssignmentRequest assignmentRequest;
                try {
                    System.out.println("Received JSON: " + assignmentData);
                    assignmentRequest = objectMapper.readValue(assignmentData, AssignmentRequest.class);
                    Assignment assignment = new Assignment();
                    assignment.setName(assignmentRequest.getName());
                    assignment.setDescription(assignmentRequest.getDescription());
                    assignment.setDueDateTime(assignmentRequest.getDueDateTime());
                    assignment.setPoints(assignmentRequest.getPoints());

                    Group group = new Group();
                    group.setGroup_id(assignmentRequest.getGroup_id());
                    assignment.setGroup(group);

                    if (!file.isEmpty()) {
                        String fileName = storageService.storeAssignment(file);
                        assignment.setImageUrl("/uploads/assignments/" + fileName);
                    }
                    assignmentService.saveAssignment(assignment);
                    return ResponseEntity.status(HttpStatus.CREATED).body("Assignment created successfully");
                } catch (InvalidDefinitionException e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to parse assignment data: " + e.getMessage());
                } catch (Exception e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create assignment");
                }
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only professors can create assignments");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
    }

    @GetMapping("/{groupId}/assignments")
    public ResponseEntity<List<Assignment>> getAssignments(@PathVariable Long groupId) {
        List<Assignment> assignments = assignmentService.getAssignmentsByGroupId(groupId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/assignments/{assignmentId}")
    public ResponseEntity<Assignment> getAssignment(@PathVariable Long assignmentId, HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null && jwtUtil.validateToken(token)) {
            Assignment assignment = assignmentService.getAssignmentById(assignmentId);
            return ResponseEntity.ok(assignment);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(HttpServletRequest request, @PathVariable Long assignmentId, @RequestPart("file") MultipartFile file) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null) {
            String role = jwtUtil.getRoleFromToken(token);
            if (role.equals("STUDENT")) {
                AssignmentSubmission submission = new AssignmentSubmission();
                try {
                    String fileName = storageService.storeAssignmentSubmission(file);
                    submission.setFileUrl("/uploads/assignmentsubmits/" + fileName);
                    submission.setAssignment(new Assignment(assignmentId));
                    submission.setStudent(new User(jwtUtil.getUsernameFromToken(token))); // Pretpostavljamo da imamo konstruktor User(String username)
                    assignmentService.saveSubmission(submission);
                    return ResponseEntity.status(HttpStatus.CREATED).body("Submission created successfully");
                } catch (Exception e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to submit assignment");
                }
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only students can submit assignments");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissions(@PathVariable Long assignmentId) {
        List<AssignmentSubmission> submissions = assignmentService.getSubmissionsByAssignmentId(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @PostMapping("/assignments/{assignmentId}/submissions/{submissionId}/feedback")
    public ResponseEntity<?> provideFeedback(@PathVariable Long submissionId, @RequestBody AssignmentSubmission feedback) {
        try {
            AssignmentSubmission submission = assignmentService.getSubmissionById(submissionId);
            submission.setFeedback(feedback.getFeedback());
            submission.setGrade(feedback.getGrade());
            assignmentService.updateSubmission(submission);
            return ResponseEntity.ok("Feedback provided successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to provide feedback");
        }
    }

}
