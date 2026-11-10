package com.enterpriseai.backend.service;

import com.enterpriseai.backend.dto.ChangePasswordRequest;
import com.enterpriseai.backend.dto.UpdateProfileRequest;
import com.enterpriseai.backend.entity.User;
import com.enterpriseai.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles profile retrieval, profile updates, and password changes.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    @Transactional
    public User updateProfile(String id, UpdateProfileRequest request) {
        User user = getUserById(id);
        if (request.getName()       != null) user.setName(request.getName());
        if (request.getPhone()      != null) user.setPhone(request.getPhone());
        if (request.getLocation()   != null) user.setLocation(request.getLocation());
        if (request.getCompany()    != null) user.setCompany(request.getCompany());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getBio()        != null) user.setBio(request.getBio());
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String id, ChangePasswordRequest request) {
        User user = getUserById(id);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
