package com.enterpriseai.backend.repository;

import com.enterpriseai.backend.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, String> {

    Optional<Settings> findByUserId(String userId);
}
