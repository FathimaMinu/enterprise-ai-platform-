package com.enterpriseai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String userId;

    // General
    private String companyName   = "My Company";
    private String timezone      = "America/New_York";
    private String language      = "en";
    private String dateFormat    = "MM/DD/YYYY";

    // Security
    private boolean twoFactorEnabled = false;
    private int     sessionTimeout   = 30;
    private int     passwordExpiry   = 90;
    private boolean ipWhitelist      = false;

    // Notifications
    private boolean emailAlerts       = true;
    private boolean pushNotifications = true;
    private boolean weeklyDigest      = true;
    private boolean queryAlerts       = false;
    private boolean securityAlerts    = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
