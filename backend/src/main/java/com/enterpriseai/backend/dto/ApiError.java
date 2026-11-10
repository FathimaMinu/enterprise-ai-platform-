package com.enterpriseai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {
    private int              status;
    private String           message;
    private LocalDateTime    timestamp;
    private Map<String, String> fieldErrors; // nullable — only for validation failures

    public ApiError(int status, String message) {
        this.status    = status;
        this.message   = message;
        this.timestamp = LocalDateTime.now();
    }
}
