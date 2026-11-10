package com.enterpriseai.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:5173")
public class TestController {
    
    @GetMapping
    public Map<String, String> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Backend is running successfully!");
        response.put("status", "OK");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return response;
    }
    
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Enterprise AI Backend");
        return health;
    }
}