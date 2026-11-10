package com.enterpriseai.backend.service;

import com.enterpriseai.backend.dto.AuthResponse;
import com.enterpriseai.backend.dto.LoginRequest;
import com.enterpriseai.backend.dto.RegisterRequest;
import com.enterpriseai.backend.entity.User;
import com.enterpriseai.backend.repository.UserRepository;
import com.enterpriseai.backend.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles user registration and login.
 * Generates a JWT token on successful authentication.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ----------------------------------------------------------------
    // Register
    // ----------------------------------------------------------------

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDepartment(request.getDepartment() != null ? request.getDepartment() : "General");
        user.setRole("USER");

        userRepository.save(user);
        log.info("Registered new user: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getName(), user.getRole());
    }

    // ----------------------------------------------------------------
    // Login
    // ----------------------------------------------------------------

    public AuthResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getName(), user.getRole());
    }
}
