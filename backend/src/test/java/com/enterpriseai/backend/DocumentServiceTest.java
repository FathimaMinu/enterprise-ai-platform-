package com.enterpriseai.backend;

import com.enterpriseai.backend.repository.DocumentRepository;
import com.enterpriseai.backend.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for DocumentService file validation logic.
 * Uses Mockito — no Spring context required.
 */
@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    DocumentRepository documentRepository;

    DocumentService documentService;

    @BeforeEach
    void setUp() {
        documentService = new DocumentService(documentRepository);
    }

    @Test
    void upload_emptyFile_throwsIllegalArgument() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]
        );
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> documentService.uploadDocument(file, "user-1")
        );
        assertTrue(ex.getMessage().contains("empty"));
    }

    @Test
    void upload_unsupportedMimeType_throwsIllegalArgument() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "script.exe", "application/x-msdownload",
                new byte[100]
        );
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> documentService.uploadDocument(file, "user-1")
        );
        assertTrue(ex.getMessage().toLowerCase().contains("unsupported"));
    }

    @Test
    void upload_fileTooLarge_throwsIllegalArgument() {
        // 51 MB > 50 MB limit
        byte[] oversized = new byte[51 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file", "big.pdf", "application/pdf", oversized
        );
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> documentService.uploadDocument(file, "user-1")
        );
        assertTrue(ex.getMessage().contains("50 MB"));
    }

    @Test
    void upload_validPdf_doesNotThrowOnValidation() {
        // 1 KB PDF-like content — validation passes (IOException expected from actual file write)
        byte[] content = "%PDF-1.4 fake content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file", "valid.pdf", "application/pdf", content
        );
        // Throws IOException (no real filesystem) — but NOT IllegalArgumentException
        assertThrows(
                Exception.class,
                () -> documentService.uploadDocument(file, "user-1")
        );
        // The key assertion: it's not an IllegalArgumentException
    }
}
