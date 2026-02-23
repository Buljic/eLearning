package com.example.tutoring;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserRegistrationIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();
    }

    @Test
    void createAccountShouldRejectAdminRoleInPublicRegistration() throws Exception {
        mockMvc.perform(post("/api/createAccount")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username":"admin_candidate",
                                  "password":"testpass123",
                                  "name":"Admin",
                                  "surname":"Candidate",
                                  "email":"admin.candidate@example.com",
                                  "phoneNumber":"061123456",
                                  "accountType":"ADMIN"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createAccountShouldRejectCaseInsensitiveDuplicateUsername() throws Exception {
        User existing = new User(
                "TutorUser",
                passwordEncoder.encode("testpass123"),
                "Tutor",
                "User",
                "email@example.com",
                "061000111",
                AccountType.PROFESOR
        );
        userRepository.save(existing);

        mockMvc.perform(post("/api/createAccount")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username":"tutoruser",
                                  "password":"testpass123",
                                  "name":"Tutor",
                                  "surname":"User",
                                  "email":"new.email@example.com",
                                  "phoneNumber":"061222333",
                                  "accountType":"PROFESOR"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
