package com.enterpriseai.backend.controller;

import com.enterpriseai.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /** GET /api/analytics/stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(analyticsService.getStats());
    }

    /** GET /api/analytics/queries?range=week */
    @GetMapping("/queries")
    public ResponseEntity<List<Map<String, Object>>> getQueries(
            @RequestParam(defaultValue = "week") String range) {
        return ResponseEntity.ok(analyticsService.getQueriesByRange(range));
    }

    /** GET /api/analytics/departments */
    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        return ResponseEntity.ok(analyticsService.getByDepartment());
    }
}
