package com.enterpriseai.backend.dto;

import com.enterpriseai.backend.entity.Document;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentResponse {
    private String id;
    private String name;
    private String type;
    private Long   size;
    private String url;
    private String uploadedBy;
    private String status;
    private LocalDateTime createdAt;

    public static DocumentResponse from(Document doc) {
        DocumentResponse r = new DocumentResponse();
        r.id         = doc.getId();
        r.name       = doc.getName();
        r.type       = doc.getType();
        r.size       = doc.getSize();
        r.url        = doc.getUrl();
        r.uploadedBy = doc.getUserId();
        r.status     = doc.getStatus();
        r.createdAt  = doc.getCreatedAt();
        return r;
    }
}
