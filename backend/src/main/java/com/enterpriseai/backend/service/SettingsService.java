package com.enterpriseai.backend.service;

import com.enterpriseai.backend.entity.Settings;
import com.enterpriseai.backend.repository.SettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final SettingsRepository repo;

    public SettingsService(SettingsRepository repo) {
        this.repo = repo;
    }

    public Settings getByUserId(String userId) {
        return repo.findByUserId(userId).orElseGet(() -> createDefault(userId));
    }

    @Transactional
    public Settings save(Settings settings) {
        return repo.save(settings);
    }

    @Transactional
    public Settings update(String userId, Settings updates) {
        Settings existing = getByUserId(userId);
        // General
        if (updates.getCompanyName() != null) existing.setCompanyName(updates.getCompanyName());
        if (updates.getTimezone()    != null) existing.setTimezone(updates.getTimezone());
        if (updates.getLanguage()    != null) existing.setLanguage(updates.getLanguage());
        if (updates.getDateFormat()  != null) existing.setDateFormat(updates.getDateFormat());
        // Security
        existing.setTwoFactorEnabled(updates.isTwoFactorEnabled());
        existing.setSessionTimeout(updates.getSessionTimeout());
        existing.setPasswordExpiry(updates.getPasswordExpiry());
        existing.setIpWhitelist(updates.isIpWhitelist());
        // Notifications
        existing.setEmailAlerts(updates.isEmailAlerts());
        existing.setPushNotifications(updates.isPushNotifications());
        existing.setWeeklyDigest(updates.isWeeklyDigest());
        existing.setQueryAlerts(updates.isQueryAlerts());
        existing.setSecurityAlerts(updates.isSecurityAlerts());
        return repo.save(existing);
    }

    private Settings createDefault(String userId) {
        Settings s = new Settings();
        s.setUserId(userId);
        return repo.save(s);
    }
}
