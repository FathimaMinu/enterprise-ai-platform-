package com.enterpriseai.backend;

import com.enterpriseai.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for JwtUtil — no Spring context needed.
 */
class JwtUtilTest {

    private JwtUtil jwtUtil;

    // Valid Base64-encoded 64-byte key for HS256
    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQtZm9yLXVuaXQtdGVzdHMtb25seS1kb25vdC11c2UtaW4tcHJvZA==";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret",        TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expirationMs",  86400000L);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtUtil.generateToken("user-1", "test@example.com", "USER");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void validateToken_returnsTrueForValidToken() {
        String token = jwtUtil.generateToken("user-1", "test@example.com", "USER");
        assertTrue(jwtUtil.validateToken(token));
    }

    @Test
    void validateToken_returnsFalseForGarbage() {
        assertFalse(jwtUtil.validateToken("not.a.real.token"));
    }

    @Test
    void extractUserId_returnsCorrectSubject() {
        String token = jwtUtil.generateToken("user-42", "a@b.com", "ADMIN");
        assertEquals("user-42", jwtUtil.extractUserId(token));
    }

    @Test
    void extractEmail_returnsCorrectEmail() {
        String token = jwtUtil.generateToken("u1", "hello@enterprise.ai", "USER");
        assertEquals("hello@enterprise.ai", jwtUtil.extractEmail(token));
    }

    @Test
    void extractRole_returnsCorrectRole() {
        String token = jwtUtil.generateToken("u1", "a@b.com", "MANAGER");
        assertEquals("MANAGER", jwtUtil.extractRole(token));
    }

    @Test
    void validateToken_returnsFalseForExpiredToken() {
        // Set 1 ms expiry so the token expires immediately
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 1L);
        String token = jwtUtil.generateToken("u1", "a@b.com", "USER");

        try { Thread.sleep(5); } catch (InterruptedException ignored) {}

        assertFalse(jwtUtil.validateToken(token));
    }
}
