package com.enterpriseai.backend.controller;

import com.enterpriseai.backend.dto.DocumentResponse;
import com.enterpriseai.backend.entity.Document;
import com.enterpriseai.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /** GET /api/documents */
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocuments() {
        List<DocumentResponse> docs = documentService.listDocuments()
                .stream()
                .map(DocumentResponse::from)
                .toList();
        return ResponseEntity.ok(docs);
    }

    /** GET /api/documents/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable String id) {
        return ResponseEntity.ok(DocumentResponse.from(documentService.getDocument(id)));
    }

    /** POST /api/documents/upload */
    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) throws IOException {

        Document saved = documentService.uploadDocument(file, principal.getUsername());
        return ResponseEntity.ok(DocumentResponse.from(saved));
    }

    /** DELETE /api/documents/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable String id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
