package com.enterpriseai.backend.service;

import com.enterpriseai.backend.repository.ChatMessageRepository;
import com.enterpriseai.backend.repository.DocumentRepository;
import com.enterpriseai.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Provides aggregated analytics data from the database.
 */
@Service
public class AnalyticsService {

    private final UserRepository        userRepo;
    private final DocumentRepository    docRepo;
    private final ChatMessageRepository chatRepo;

    public AnalyticsService(UserRepository userRepo,
                            DocumentRepository docRepo,
                            ChatMessageRepository chatRepo) {
        this.userRepo = userRepo;
        this.docRepo  = docRepo;
        this.chatRepo = chatRepo;
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        long totalChats = chatRepo.count();
        long totalDocs = docRepo.count();
        
        stats.put("totalQueries",     totalChats);
        stats.put("avgResponseTimeMs", 1400);          // placeholder - requires response time field
        stats.put("documentsIndexed",  totalDocs);
        stats.put("costSaved",         totalDocs * 10.0); // $10 saved per document indexed
        
        // Add trend percentages (static for now - could be calculated from historical data)
        stats.put("queriesGrowth",    "+12%");
        stats.put("docsGrowth",      "+8%");
        stats.put("savingsGrowth",   "+15%");
        
        return stats;
    }

    /** Returns query count per day for the last 7 days. */
    public List<Map<String, Object>> getQueriesByRange(String range) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        List<Map<String, Object>> dbResult = chatRepo.countQueriesByDay(startDate);
        
        // If no data, return empty list
        if (dbResult.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Ensure all 7 days are represented with 0 if missing
        Map<String, Long> dayCounts = new LinkedHashMap<>();
        for (Map<String, Object> row : dbResult) {
            String dayName = (String) row.get("day");
            Number count = (Number) row.get("queries");
            dayCounts.put(dayName, count != null ? count.longValue() : 0L);
        }
        
        // Order days correctly (Mon-Sun)
        String[] orderedDays = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        List<Map<String, Object>> result = new ArrayList<>();
        for (String day : orderedDays) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("day", day);
            entry.put("queries", dayCounts.getOrDefault(day, 0L));
            result.add(entry);
        }
        
        return result;
    }

    /** Returns query count grouped by user department. */
    public List<Map<String, Object>> getByDepartment() {
        List<Map<String, Object>> dbResult = chatRepo.countQueriesByDepartment();
        
        // If no data, return empty list
        if (dbResult.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Add colors for frontend display
        String[] colors = {"#2563eb", "#7c3aed", "#06b6d4", "#22c55e", "#f59e0b"};
        int colorIndex = 0;
        
        for (Map<String, Object> dept : dbResult) {
            dept.put("color", colors[colorIndex % colors.length]);
            colorIndex++;
        }
        
        return dbResult;
    }
}
