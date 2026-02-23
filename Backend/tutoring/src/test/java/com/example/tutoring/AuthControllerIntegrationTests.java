package com.example.tutoring;

import com.example.tutoring.Entities.User;
import com.example.tutoring.Other.AccountType;
import com.example.tutoring.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();
        User user = new User("testuser", passwordEncoder.encode("testpass123"), "Test", "User", "test@example.com", "000111222", AccountType.STUDENT);
        userRepository.save(user);
    }

    @Test
    void loginShouldSetAccessAndRefreshCookies() throws Exception {
        var response = mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"password\":\"testpass123\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();

        var allSetCookies = response.getHeaders(HttpHeaders.SET_COOKIE);
        assertThat(allSetCookies).anySatisfy(cookie -> assertThat(cookie).contains("JWT="));
        assertThat(allSetCookies).anySatisfy(cookie -> assertThat(cookie).contains("JWT_REFRESH="));
        assertThat(response.getCookie("JWT_REFRESH")).isNotNull();
        assertThat(response.getCookie("JWT_REFRESH").getPath()).isEqualTo("/api/auth");
    }

    @Test
    void refreshShouldRotateBothCookiesWhenRefreshCookieProvided() throws Exception {
        var loginResponse = mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"password\":\"testpass123\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();

        var refreshCookie = loginResponse.getCookie("JWT_REFRESH");
        assertThat(refreshCookie).isNotNull();

        var refreshSetCookies = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(refreshCookie))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getHeaders(HttpHeaders.SET_COOKIE);

        assertThat(refreshSetCookies).anySatisfy(cookie -> assertThat(cookie).contains("JWT="));
        assertThat(refreshSetCookies).anySatisfy(cookie -> assertThat(cookie).contains("JWT_REFRESH="));
        assertThat(refreshSetCookies.stream()
                .filter(cookie -> cookie.contains("JWT_REFRESH="))
                .anyMatch(cookie -> cookie.contains("Path=/api/auth"))).isTrue();
    }

    @Test
    void refreshShouldReturnUnauthorizedWithoutRefreshCookie() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutShouldExpireAccessAndRefreshCookies() throws Exception {
        var logoutSetCookies = mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getHeaders(HttpHeaders.SET_COOKIE);

        assertThat(logoutSetCookies).anySatisfy(cookie -> {
            assertThat(cookie).contains("JWT=");
            assertThat(cookie).contains("Max-Age=0");
        });
        assertThat(logoutSetCookies).anySatisfy(cookie -> {
            assertThat(cookie).contains("JWT_REFRESH=");
            assertThat(cookie).contains("Max-Age=0");
        });
    }
}
