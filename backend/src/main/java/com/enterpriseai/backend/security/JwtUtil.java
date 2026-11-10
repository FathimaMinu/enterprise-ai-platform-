package com.enterpriseai.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility for generating and validating JWT tokens.
 * Uses HS256, 24-hour expiry, and reads secret from ${jwt.secret}.
 */
@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expirationMs;

    // ----------------------------------------------------------------
    // Token generation
    // ----------------------------------------------------------------

    /**
     * Generates a signed JWT containing userId, email, and role claims.
     */
    public String generateToken(String userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ----------------------------------------------------------------
    // Token validation
    // ----------------------------------------------------------------

    /**
     * Returns true if the token is structurally valid, signed correctly,
     * and not expired.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token is unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT token is malformed: {}", e.getMessage());
        } catch (SignatureException e) {
            log.warn("JWT signature validation failed: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    // ----------------------------------------------------------------
    // Claim extraction
    // ----------------------------------------------------------------

    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractEmail(String token) {
        return (String) parseClaims(token).get("email");
    }

    public String extractRole(String token) {
        return (String) parseClaims(token).get("role");
    }

    public Date extractExpiration(String token) {
        return parseClaims(token).getExpiration();
    }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                "JWT secret must be at least 32 characters (got " + keyBytes.length + ")"
            );
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
