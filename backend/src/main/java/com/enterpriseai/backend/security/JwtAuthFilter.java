package com.enterpriseai.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * JWT authentication filter.
 * Runs once per request, extracts and validates the Bearer token,
 * and sets the SecurityContext if the token is valid.
 * Skips public routes entirely.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/api/auth/**",
            "/api/test/**",
            "/h2-console/**"
    );

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return PUBLIC_PATHS.stream().anyMatch(p -> pathMatcher.match(p, path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractBearerToken(request);

        if (StringUtils.hasText(token)) {
            if (jwtUtil.validateToken(token)) {
                try {
                    String email = jwtUtil.extractEmail(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                } catch (Exception e) {
                    log.error("Could not set user authentication in security context: {}", e.getMessage());
                    sendUnauthorized(response, "Authentication processing failed");
                    return;
                }
            } else {
                sendUnauthorized(response, "Invalid or expired token");
                return;
            }
        }
        // No token present — let Spring Security handle the 401 for protected routes
        filterChain.doFilter(request, response);
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"status\":401,\"message\":\"" + message + "\"}"
        );
    }
}
