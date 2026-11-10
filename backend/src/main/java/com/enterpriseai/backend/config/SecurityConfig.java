package com.enterpriseai.backend.config;

import com.enterpriseai.backend.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security configuration.
 * - JWT stateless sessions
 * - Public: /api/auth/**, /api/test/**, /h2-console/**
 * - Protected: everything else under /api/**
 * - CORS origins sourced from ${cors.allowed.origins} env var
 * - BCryptPasswordEncoder provided as a @Bean
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed.origins:http://localhost:5173}")
    private String allowedOriginsRaw;

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    // Public routes
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/test/**").permitAll()
                    .requestMatchers("/h2-console/**").permitAll()
                    // All other API routes require a valid JWT
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().permitAll()
            )
            // Allow H2 console frames (only active when H2 is enabled — dev profile)
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            // Insert JWT filter before the standard username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Parse comma-separated origins from env var
        List<String> origins = Arrays.asList(allowedOriginsRaw.split(","));
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
