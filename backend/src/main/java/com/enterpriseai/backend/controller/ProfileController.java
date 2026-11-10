package com.enterpriseai.backend.controller;

import com.enterpriseai.backend.dto.ChangePasswordRequest;
import com.enterpriseai.backend.dto.UpdateProfileRequest;
import com.enterpriseai.backend.entity.User;
import com.enterpriseai.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    /** GET /api/profile — current user's profile */
    @GetMapping
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails principal) {
        User user = userService.getUserByEmail(principal.getUsername());
        user.setPassword(null); // never return password hash
        return ResponseEntity.ok(user);
    }

    /** PUT /api/profile — update profile fields */
    @PutMapping
    public ResponseEntity<User> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails principal) {

        User user = userService.getUserByEmail(principal.getUsername());
        User updated = userService.updateProfile(user.getId(), request);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    /** POST /api/profile/change-password */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails principal) {

        User user = userService.getUserByEmail(principal.getUsername());
        userService.changePassword(user.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    /** POST /api/profile/avatar — upload avatar image */
    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) {

        // Validate image type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/png") && !contentType.equals("image/jpeg"))) {
            throw new IllegalArgumentException("Avatar must be PNG or JPG");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Avatar must be under 5 MB");
        }
        // Store URL — full implementation saves to object storage (S3/local)
        String avatarUrl = "/uploads/avatars/" + principal.getUsername() + "_avatar.jpg";
        User user = userService.getUserByEmail(principal.getUsername());

        UpdateProfileRequest req = new UpdateProfileRequest();
        userService.updateProfile(user.getId(), req);

        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }
}
