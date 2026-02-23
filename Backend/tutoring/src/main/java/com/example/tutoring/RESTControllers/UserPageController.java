package com.example.tutoring.RESTControllers;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.DTOs.StringNumber;
import com.example.tutoring.Entities.Group;
import com.example.tutoring.Repositories.SubjectRepository;
import com.example.tutoring.Security.JwtUtil;
import com.example.tutoring.Services.GroupService;
import com.example.tutoring.Services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class UserPageController {
    private static final int MAX_GROUPS_PAGE_SIZE = 100;
    private final SubjectRepository subjectRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final GroupService groupService;

    public UserPageController(
            SubjectRepository subjectRepository,
            UserService userService,
            JwtUtil jwtUtil,
            GroupService groupService
    ) {
        this.subjectRepository = subjectRepository;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.groupService = groupService;
    }

    @GetMapping("/allSubjects")
    public ResponseEntity<?> giveAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAllSubjects());
    }

    @GetMapping("/mostTutorSubjects")
    public ResponseEntity<?> giveSubjectsWithMostTutors() {
        List<StringNumber> list = userService.findMostTutorSubjects();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/subjects/search")
    public ResponseEntity<?> giveSearchedSubjects(@RequestParam String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return ResponseEntity.ok(subjectRepository.findAllSubjects());
        }
        // Always return a list to keep API contract stable on frontend.
        return ResponseEntity.ok(userService.findSearchedSubjects(searchTerm));
    }

    @GetMapping("/getTutorsFor")
    public ResponseEntity<?> getTutorsForSubject(@RequestParam String subject) {
        if (subject == null || subject.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Prazan subject parameter");
        }
        List<GenericDTO> tutors = userService.getTutorsForSubjectWithInfo(subject);
        return ResponseEntity.ok(tutors);
    }

    @PostMapping("/registerForSubjectAsTutor")
    public ResponseEntity<?> requestASubject(HttpServletRequest request, @RequestBody GenericDTO genericDTO) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String username = jwtUtil.getUsernameFromToken(token);
        try {
            userService.insertIntoTutorSubjectRequest(
                    (String) genericDTO.getProperty("inputSubject"),
                    username,
                    (String) genericDTO.getProperty("comment")
            );
            return ResponseEntity.ok("Zahtjev uspjesno kreiran");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Doslo je do greske prilikom kreiranja zahtjeva.");
        }
    }

    @GetMapping("/getUser/{username}")
    public ResponseEntity<?> getCertainUserInfo(@PathVariable String username, HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        try {
            GenericDTO user = userService.getUserInfoExtended(username);
            Object accountType = user.getProperty("account_type");

            if (isTutorRole(accountType)) {
                List<GenericDTO> subjects = userService.findTutorsSubjectsWithInfo((Long) user.getProperty("id"));
                user.addProperty("subjects", subjects);
            }

            String requesterUsername = jwtUtil.getUsernameFromToken(token);
            if (!requesterUsername.equalsIgnoreCase(username)) {
                user.getProperties().remove("email");
                user.getProperties().remove("phone_number");
            }

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @GetMapping("/getAttendedGroups")
    public ResponseEntity<?> getAttendedCourses(@RequestParam Long userId, HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromCookie(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Long authenticatedUserId = userService.getUserIdFromToken(token);
        if (!authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
        }
        return ResponseEntity.ok(userService.findAttendedCourses(userId));
    }

    @GetMapping("/getUsers")
    public ResponseEntity<?> getSearchedUsers(@RequestParam String searchTerm) {
        return ResponseEntity.ok(userService.getSearchedUsers(searchTerm));
    }

    @PostMapping("/createGroup")
    public ResponseEntity<?> createGroup(HttpServletRequest httpRequest, @RequestBody GenericDTO request) {
        try {
            String token = jwtUtil.extractJwtFromCookie(httpRequest);
            if (token == null || !jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            }
            if (!isTutorRole(jwtUtil.getRoleFromToken(token))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Samo profesori mogu kreirati grupu.");
            }
            Long tutorId = userService.getUserIdFromToken(token);
            userService.createGroup(request, tutorId);
            return ResponseEntity.ok("Grupa uspjesno kreirana");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/getGroups")
    public ResponseEntity<?> getGroups(
            @RequestParam Map<String, String> filters,
            @RequestParam int page,
            @RequestParam int size
    ) {
        try {
            if (page < 0 || size <= 0 || size > MAX_GROUPS_PAGE_SIZE) {
                return ResponseEntity.badRequest().body("Invalid pagination values");
            }

            Map<String, Object> convertedFilters = new HashMap<>();
            for (Map.Entry<String, String> entry : filters.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();

                if (value == null || value.trim().isEmpty()) {
                    continue;
                }

                if ("subjects".equals(key)) {
                    convertedFilters.put(key, Arrays.asList(value.split(",")));
                } else if (key.endsWith("_from") || key.endsWith("_to") || "start_date".equals(key) || "end_date".equals(key)) {
                    convertedFilters.put(key, value);
                } else if ("price".equals(key) || "price_from".equals(key) || "price_to".equals(key)) {
                    convertedFilters.put(key, Double.parseDouble(value));
                } else if ("max_students".equals(key) || "max_students_from".equals(key) || "max_students_to".equals(key)
                        || "hours_per_week".equals(key) || "hours_per_week_from".equals(key) || "hours_per_week_to".equals(key)) {
                    convertedFilters.put(key, Integer.parseInt(value));
                } else {
                    convertedFilters.put(key, value);
                }
            }

            GenericDTO filterDTO = new GenericDTO(convertedFilters);
            List<GenericDTO> groups = userService.getFilteredGroups(filterDTO, page, size);
            int totalCount = userService.getTotalCount(filterDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("groups", groups);
            response.put("totalCount", totalCount);
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid numeric filter value");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching groups");
        }
    }

    @PostMapping("/groups/{groupId}/request-access")
    public ResponseEntity<?> requestAccess(@PathVariable Long groupId, HttpServletRequest request) {
        try {
            String token = jwtUtil.extractJwtFromCookie(request);
            if (token == null || !jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Neispravan ili nedostajuci JWT");
            }
            String accountType = jwtUtil.getRoleFromToken(token);
            if (!isStudentRole(accountType)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Samo studenti mogu traziti pristup grupama.");
            }
            Long userId = userService.getUserIdFromToken(token);
            groupService.requestAccess(groupId, userId);
            return ResponseEntity.ok("Zahtjev za pristup je uspjesno poslan.");
        } catch (IllegalStateException e) {
            String message = e.getMessage() == null ? "Zahtjev nije moguce obraditi." : e.getMessage();
            if (message.contains("Vec ste poslali zahtjev")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
            }
            if (message.contains("Vec ste clan")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
            }
            return ResponseEntity.badRequest().body(message);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Doslo je do greske. Pokusajte ponovo kasnije.");
        }
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<?> getGroupDetails(@PathVariable Long groupId, HttpServletRequest request) {
        try {
            String token = jwtUtil.extractJwtFromCookie(request);
            if (token == null || !jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            }

            Group group = groupService.findGroupById(groupId);
            if (group == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found");
            }

            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
        }
    }

    private boolean isTutorRole(Object role) {
        return "PROFESOR".equals(role) || "OBOJE".equals(role) || "ADMIN".equals(role);
    }

    private boolean isStudentRole(Object role) {
        return "STUDENT".equals(role) || "OBOJE".equals(role);
    }
}
