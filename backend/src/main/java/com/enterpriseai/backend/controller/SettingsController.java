package com.enterpriseai.backend.controller;

import com.enterpriseai.backend.entity.Settings;
import com.enterpriseai.backend.entity.User;
import com.enterpriseai.backend.service.SettingsService;
import com.enterpriseai.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;
    private final UserService     userService;

    public SettingsController(SettingsService settingsService, UserService userService) {
        this.settingsService = settingsService;
        this.userService     = userService;
    }

    /** GET /api/settings — get current user's settings */
    @GetMapping
    public ResponseEntity<Settings> getSettings(@AuthenticationPrincipal UserDetails principal) {
        User user = userService.getUserByEmail(principal.getUsername());
        return ResponseEntity.ok(settingsService.getByUserId(user.getId()));
    }

    /** PUT /api/settings — save settings */
    @PutMapping
    public ResponseEntity<Settings> updateSettings(
            @RequestBody Settings updates,
            @AuthenticationPrincipal UserDetails principal) {

        User user = userService.getUserByEmail(principal.getUsername());
        return ResponseEntity.ok(settingsService.update(user.getId(), updates));
    }
}
