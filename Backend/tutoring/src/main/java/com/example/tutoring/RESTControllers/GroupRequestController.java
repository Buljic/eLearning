package com.example.tutoring.RESTControllers;

import com.example.tutoring.AutomaticUpdateOperations.GroupRequestService;
import com.example.tutoring.Entities.Embeddeds.GroupRequestId;
import com.example.tutoring.Entities.GroupRequest;
import com.example.tutoring.Other.RequestStatus;
import com.example.tutoring.Security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class GroupRequestController {
    private final GroupRequestService groupRequestService;
    private final JwtUtil jwtUtil;

    public GroupRequestController(GroupRequestService groupRequestService, JwtUtil jwtUtil) {
        this.groupRequestService = groupRequestService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getAllRequests(HttpServletRequest request,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token != null) {
            String role = jwtUtil.getRoleFromToken(token);
            if (!role.equals("PROFESOR")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String tutorUsername = jwtUtil.getUsernameFromToken(token);
        Map<String, Object> result = groupRequestService.getRequests(tutorUsername, page, size);

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @PostMapping("/{groupId}/{userId}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long groupId,
                                           @PathVariable Long userId,
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

        groupRequestService.acceptRequest(groupId, userId);
        return ResponseEntity.status(HttpStatus.OK).body("Zahtjev uspješno prihvaćen.");
    }

    @PostMapping("/{groupId}/{userId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long groupId,
                                            @PathVariable Long userId,
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

        try {
            groupRequestService.approveRequest(groupId, userId);
            return ResponseEntity.status(HttpStatus.OK).body("Zahtjev uspješno odobren.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/{groupId}/{userId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long groupId,
                                           @PathVariable Long userId,
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

        groupRequestService.rejectRequest(groupId, userId);
        return ResponseEntity.status(HttpStatus.OK).body("Zahtjev uspješno odbijen.");
    }
}

