package com.enterpriseai.backend.service;

import com.enterpriseai.backend.entity.Document;
import com.enterpriseai.backend.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Handles document upload (with MIME + size validation),
 * storage, retrieval, deletion, and AI indexing trigger.
 */
@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private static final long   MAX_SIZE_BYTES = 50L * 1024 * 1024; // 50 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/plain",
            "image/png",
            "image/jpeg"
    );

    private final DocumentRepository documentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    // ----------------------------------------------------------------
    // Upload
    // ----------------------------------------------------------------

    @Transactional
    public Document uploadDocument(MultipartFile file, String userId) throws IOException {
        validateFile(file);

        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName  = UUID.randomUUID() + "_" + file.getOriginalFilename();
        File   destFile  = new File(uploadDir + fileName);
        file.transferTo(destFile);

        Document document = new Document();
        document.setName(file.getOriginalFilename());
        document.setType(file.getContentType());
        document.setSize(file.getSize());
        document.setUrl("/uploads/" + fileName);
        document.setUserId(userId);
        document.setStatus("processing");

        Document saved = documentRepository.save(document);

        // Trigger async indexing in AI service (best-effort)
        triggerIndexing(saved.getId(), destFile.getAbsolutePath());

        // Simulate processing delay and update status to "processed" after 3 seconds
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(3000);
                documentRepository.findById(saved.getId()).ifPresent(doc -> {
                    doc.setStatus("processed");
                    documentRepository.save(doc);
                    log.info("Document {} status updated to processed", saved.getId());
                });
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Async status update interrupted for document {}", saved.getId());
            }
        });

        return saved;
    }

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------

    public List<Document> listDocuments() {
        return documentRepository.findAllByOrderByCreatedAtDesc();
    }

    public Document getDocument(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));
    }

    // ----------------------------------------------------------------
    // Delete
    // ----------------------------------------------------------------

    @Transactional
    public void deleteDocument(String id) {
        Document doc = getDocument(id);
        // Remove physical file
        try {
            File f = new File(System.getProperty("user.dir") + doc.getUrl());
            if (f.exists()) f.delete();
        } catch (Exception e) {
            log.warn("Could not delete file from disk for document {}: {}", id, e.getMessage());
        }
        documentRepository.deleteById(id);
    }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds 50 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Unsupported file type: " + contentType +
                    ". Allowed: PDF, DOCX, XLS, TXT, PNG, JPG"
            );
        }
    }

    @SuppressWarnings("unchecked")
    private void triggerIndexing(String documentId, String filePath) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, String> body = Map.of(
                    "document_id", documentId,
                    "file_path",   filePath
            );
            restTemplate.postForEntity(
                    aiServiceUrl + "/api/ai/index",
                    new HttpEntity<>(body, headers),
                    Map.class
            );
            // Update status to 'indexed' would happen via callback in production
        } catch (Exception e) {
            log.warn("AI indexing trigger failed for document {}: {}", documentId, e.getMessage());
        }
    }
}
