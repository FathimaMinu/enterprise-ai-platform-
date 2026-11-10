package com.enterpriseai.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController.
 * Uses H2 in-memory database via the "test" profile.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired MockMvc       mockMvc;
    @Autowired ObjectMapper  objectMapper;

    // ── Register ─────────────────────────────────────────────────────────────

    @Test
    void register_success_returns201WithToken() throws Exception {
        Map<String, String> body = Map.of(
                "name",       "Test User",
                "email",      "newuser@test.com",
                "password",   "Password1!"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void register_duplicateEmail_returns400() throws Exception {
        Map<String, String> body = Map.of(
                "name", "Dup User", "email", "dup@test.com", "password", "Password1!"
        );
        // First registration should succeed
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated());

        // Second registration with same email should fail
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void register_invalidEmail_returns400WithFieldError() throws Exception {
        Map<String, String> body = Map.of(
                "name", "X", "email", "not-an-email", "password", "Password1!"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    @Test
    void register_shortPassword_returns400() throws Exception {
        Map<String, String> body = Map.of(
                "name", "User", "email", "user@test.com", "password", "short"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Test
    void login_success_returnsToken() throws Exception {
        // Register first
        Map<String, String> reg = Map.of(
                "name", "Login User", "email", "loginuser@test.com", "password", "Password1!"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());

        // Then login
        Map<String, String> login = Map.of("email", "loginuser@test.com", "password", "Password1!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void login_wrongPassword_returns400() throws Exception {
        Map<String, String> reg = Map.of(
                "name", "WP User", "email", "wpuser@test.com", "password", "RightPass1!"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());

        Map<String, String> login = Map.of("email", "wpuser@test.com", "password", "WrongPass");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isBadRequest());
    }
}
