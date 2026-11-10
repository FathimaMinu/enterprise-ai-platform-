package com.enterpriseai.backend.controller;

import com.enterpriseai.backend.dto.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Centralised exception → HTTP response mapping.
 * Returns ApiError JSON for every error type;
 * never leaks stack traces to clients.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Bean validation failures (@Valid) → 400 with per-field messages */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field   = error instanceof FieldError fe ? fe.getField() : error.getObjectName();
            String message = error.getDefaultMessage();
            fieldErrors.put(field, message);
        });
        ApiError apiError = new ApiError(400, "Validation failed", null, fieldErrors);
        return ResponseEntity.badRequest().body(apiError);
    }

    /** Business rule violations → 400 */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .badRequest()
                .body(new ApiError(400, ex.getMessage()));
    }

    /** File too large → 413 */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ApiError(413, "File exceeds the maximum allowed upload size"));
    }

    /** Catch-all → 500, log actual exception server-side */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity
                .internalServerError()
                .body(new ApiError(500, "An unexpected error occurred. Please try again later."));
    }
}
