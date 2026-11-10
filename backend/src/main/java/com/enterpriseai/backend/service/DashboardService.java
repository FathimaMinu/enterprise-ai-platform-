package com.enterpriseai.backend.service;

import com.enterpriseai.backend.dto.DashboardStats;
import com.enterpriseai.backend.repository.ChatMessageRepository;
import com.enterpriseai.backend.repository.DocumentRepository;
import com.enterpriseai.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

/**
 * Aggregates platform-wide statistics for the dashboard.
 */
@Service
public class DashboardService {

    private final UserRepository        userRepository;
    private final DocumentRepository    documentRepository;
    private final ChatMessageRepository chatMessageRepository;

    public DashboardService(UserRepository userRepository,
                            DocumentRepository documentRepository,
                            ChatMessageRepository chatMessageRepository) {
        this.userRepository        = userRepository;
        this.documentRepository    = documentRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    public DashboardStats getStats() {
        long totalEmployees = userRepository.count();
        long totalDocuments = documentRepository.count();
        long totalChats     = chatMessageRepository.count();

        // Cost saved is a derived metric: $5 per AI query (illustrative)
        double costSaved = totalChats * 5.0;

        return new DashboardStats(
                totalEmployees,
                totalDocuments,
                totalChats,
                totalChats,   // aiQueriesToday == totalChats until date-scoped queries added
                costSaved
        );
    }
}
