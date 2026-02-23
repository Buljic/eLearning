package com.example.tutoring.RESTControllers;

import com.example.tutoring.AutomaticUpdateOperations.GroupRequestService;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class GroupRequestController {
    private static final int MAX_PAGE_SIZE = 100;

    private final GroupRequestService groupRequestService;
    private final GroupService groupService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public GroupRequestController(
            GroupRequestService groupRequestService,
            GroupService groupService,
            UserService userService,
            JwtUtil jwtUtil
    ) {
        this.groupRequestService = groupRequestService;
        this.groupService = groupService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getAllRequests(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!"PROFESOR".equals(jwtUtil.getRoleFromToken(token))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        if (page < 0 || size <= 0 || size > MAX_PAGE_SIZE) {
            return ResponseEntity.badRequest().body("Invalid pagination values");
        }

        String tutorUsername = jwtUtil.getUsernameFromToken(token);
        Map<String, Object> result = groupRequestService.getRequests(tutorUsername, page, size);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{groupId}/{userId}/accept")
    public ResponseEntity<?> acceptRequest(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            HttpServletRequest request
    ) {
        Long tutorId = authorizeTutorForGroup(groupId, request);
        if (tutorId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        groupRequestService.acceptRequest(groupId, userId);
        return ResponseEntity.ok("Zahtjev uspjesno prihvacen.");
    }

    @PostMapping("/{groupId}/{userId}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            HttpServletRequest request
    ) {
        Long tutorId = authorizeTutorForGroup(groupId, request);
        if (tutorId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        try {
            groupRequestService.approveRequest(groupId, userId);
            return ResponseEntity.ok("Zahtjev uspjesno odobren.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/{groupId}/{userId}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            HttpServletRequest request
    ) {
        Long tutorId = authorizeTutorForGroup(groupId, request);
        if (tutorId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        groupRequestService.rejectRequest(groupId, userId);
        return ResponseEntity.ok("Zahtjev uspjesno odbijen.");
    }

    private Long authorizeTutorForGroup(Long groupId, HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return null;
        }
        if (!"PROFESOR".equals(jwtUtil.getRoleFromToken(token))) {
            return null;
        }

        Long tutorId = userService.getUserIdFromToken(token);
        if (!groupService.isTutorOwnerOfGroup(tutorId, groupId)) {
            return null;
        }

        return tutorId;
    }
}
