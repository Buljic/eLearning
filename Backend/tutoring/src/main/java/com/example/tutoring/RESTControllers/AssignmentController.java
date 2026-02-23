package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.AssignmentRequest;
import com.example.tutoring.Entities.Assignment;
import com.example.tutoring.Entities.AssignmentSubmission;
import com.example.tutoring.Entities.Group;
import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.AssignmentService;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Services.StorageService;
import com.example.tutoring.Services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidDefinitionException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AssignmentController {
    private final AssignmentService assignmentService;
    private final JwtUtil jwtUtil;
    private final StorageService storageService;
    private final ObjectMapper objectMapper;
    private final UserService userService;
    private final GroupService groupService;

    public AssignmentController(
            AssignmentService assignmentService,
            JwtUtil jwtUtil,
            StorageService storageService,
            ObjectMapper objectMapper,
            UserService userService,
            GroupService groupService
    ) {
        this.assignmentService = assignmentService;
        this.jwtUtil = jwtUtil;
        this.storageService = storageService;
        this.objectMapper = objectMapper;
        this.userService = userService;
        this.groupService = groupService;
    }

    @PostMapping(value = "/assignments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAssignment(
            HttpServletRequest request,
            @RequestPart("assignment") String assignmentData,
            @RequestPart("file") MultipartFile file
    ) {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!canActAsProfessor(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only professors can create assignments");
        }

        try {
            AssignmentRequest assignmentRequest = objectMapper.readValue(assignmentData, AssignmentRequest.class);
            if (assignmentRequest.getGroup_id() == null || !groupService.isTutorOwnerOfGroup(currentUser.getId(), assignmentRequest.getGroup_id())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can create assignments only for your own groups");
            }

            Assignment assignment = new Assignment();
            assignment.setName(assignmentRequest.getName());
            assignment.setDescription(assignmentRequest.getDescription());
            assignment.setDueDateTime(assignmentRequest.getDueDateTime());
            assignment.setPoints(assignmentRequest.getPoints());

            Group group = new Group();
            group.setGroup_id(assignmentRequest.getGroup_id());
            assignment.setGroup(group);

            if (file != null && !file.isEmpty()) {
                String fileName = storageService.storeAssignment(file);
                assignment.setImageUrl("/uploads/assignments/" + fileName);
            }

            assignmentService.saveAssignment(assignment);
            return ResponseEntity.status(HttpStatus.CREATED).body("Assignment created successfully");
        } catch (InvalidDefinitionException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to parse assignment data: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create assignment");
        }
    }

    @GetMapping("/{groupId}/assignments")
    public ResponseEntity<List<Assignment>> getAssignments(@PathVariable Long groupId, HttpServletRequest request) {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        if (!canAccessGroup(currentUser, groupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        List<Assignment> assignments;
        if (currentUser.hasRole(AccountType.STUDENT)) {
            assignments = assignmentService.getAssignmentsByGroupIdWithSubmissionsForUser(groupId, currentUser.getId());
        } else {
            assignments = assignmentService.getAssignmentsByGroupId(groupId);
        }

        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/assignments/{assignmentId}")
    public ResponseEntity<Assignment> getAssignment(@PathVariable Long assignmentId, HttpServletRequest request) {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Long groupId = assignmentService.getGroupIdByAssignmentId(assignmentId);
        if (groupId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        if (!canAccessGroup(currentUser, groupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        Assignment assignment = assignmentService.getAssignmentById(assignmentId);
        return ResponseEntity.ok(assignment);
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(
            HttpServletRequest request,
            @PathVariable Long assignmentId,
            @RequestPart("file") MultipartFile file
    ) {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!canActAsStudent(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only students can submit assignments");
        }

        Long groupId = assignmentService.getGroupIdByAssignmentId(assignmentId);
        if (groupId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Assignment not found");
        }
        if (!groupService.isUserInGroup(currentUser.getId(), groupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not part of this group");
        }
        if (assignmentService.hasSubmissionForAssignment(assignmentId, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Submission already exists for this assignment");
        }

        try {
            String fileName = storageService.storeAssignmentSubmission(file);
            AssignmentSubmission submission = new AssignmentSubmission();
            submission.setFileUrl("/uploads/assignmentsubmits/" + fileName);
            submission.setAssignment(new Assignment(assignmentId));
            submission.setStudent(currentUser);
            assignmentService.saveSubmission(submission);
            return ResponseEntity.status(HttpStatus.CREATED).body("Submission created successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to submit assignment");
        }
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissions(@PathVariable Long assignmentId, HttpServletRequest request) {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        if (!canActAsProfessor(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        Long groupId = assignmentService.getGroupIdByAssignmentId(assignmentId);
        if (groupId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        if (!groupService.isTutorOwnerOfGroup(currentUser.getId(), groupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        List<AssignmentSubmission> submissions = assignmentService.getSubmissionsByAssignmentId(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @PostMapping("/assignments/{assignmentId}/submissions/{submissionId}/feedback")
    public ResponseEntity<?> provideFeedback(
            @PathVariable Long assignmentId,
            @PathVariable Long submissionId,
            @RequestBody AssignmentSubmission feedback,
            HttpServletRequest request
    ) {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!canActAsProfessor(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only professors can provide feedback");
        }

        Long assignmentGroupId = assignmentService.getGroupIdByAssignmentId(assignmentId);
        Long submissionGroupId = assignmentService.getGroupIdBySubmissionId(submissionId);
        if (assignmentGroupId == null || submissionGroupId == null || !assignmentGroupId.equals(submissionGroupId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Submission does not belong to assignment");
        }
        if (!groupService.isTutorOwnerOfGroup(currentUser.getId(), assignmentGroupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot grade submissions outside your groups");
        }

        try {
            AssignmentSubmission submission = assignmentService.getSubmissionById(submissionId);
            submission.setFeedback(feedback.getFeedback());
            submission.setGrade(feedback.getGrade());
            assignmentService.updateSubmission(submission);
            return ResponseEntity.ok("Feedback provided successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to provide feedback");
        }
    }

    @GetMapping("/assignments/{assignmentId}/withSubmissions")
    public ResponseEntity<Assignment> getAssignmentWithSubmissions(@PathVariable Long assignmentId, HttpServletRequest request) {
        User currentUser = authenticate(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Long groupId = assignmentService.getGroupIdByAssignmentId(assignmentId);
        if (groupId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        if (!canAccessGroup(currentUser, groupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        if (canActAsStudent(currentUser)) {
            Assignment assignment = assignmentService.getAssignmentWithSubmissions(assignmentId, currentUser.getId());
            return ResponseEntity.ok(assignment);
        }

        Assignment assignment = assignmentService.getAssignmentById(assignmentId);
        return ResponseEntity.ok(assignment);
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

    private boolean canActAsStudent(User user) {
        return user.hasRole(AccountType.STUDENT);
    }
}
