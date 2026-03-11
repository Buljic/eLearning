package ba.unze.elearning.tutoring.Security;

import ba.unze.elearning.tutoring.Entities.User;
import ba.unze.elearning.tutoring.Other.AccountType;
import ba.unze.elearning.tutoring.Services.GroupService;
import ba.unze.elearning.tutoring.Services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class AuthHelper {
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final GroupService groupService;

    public AuthHelper(JwtUtil jwtUtil, UserService userService, GroupService groupService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.groupService = groupService;
    }

    public User authenticate(HttpServletRequest request) {
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

    public boolean canAccessGroup(User user, Long groupId) {
        if (groupService.isUserInGroup(user.getId(), groupId)) {
            return true;
        }
        return canActAsProfessor(user) && groupService.isTutorOwnerOfGroup(user.getId(), groupId);
    }

    public boolean canActAsProfessor(User user) {
        return user.hasRole(AccountType.PROFESOR) || user.hasRole(AccountType.ADMIN);
    }

    public boolean canActAsStudent(User user) {
        return user.hasRole(AccountType.STUDENT);
    }
}
