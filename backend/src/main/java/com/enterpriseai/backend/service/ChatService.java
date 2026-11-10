package com.enterpriseai.backend.service;

import com.enterpriseai.backend.entity.ChatMessage;
import com.enterpriseai.backend.repository.ChatMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Handles chat message persistence and delegates AI response
 * generation to the Python AI microservice.
 * Falls back to a descriptive message if the AI service is unavailable.
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatMessageRepository chatMessageRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.restTemplate = new RestTemplate();
    }

    public List<ChatMessage> getMessages(String userId) {
        return chatMessageRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public ChatMessage sendMessage(String userId, String message) {
        String aiResponse = callAiService(message);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUserId(userId);
        chatMessage.setMessage(message);
        chatMessage.setResponse(aiResponse);
        chatMessage.setCreatedAt(LocalDateTime.now());

        return chatMessageRepository.save(chatMessage);
    }

    @Transactional
    public void deleteMessage(String messageId) {
        if (!chatMessageRepository.existsById(messageId)) {
            throw new IllegalArgumentException("Message not found: " + messageId);
        }
        chatMessageRepository.deleteById(messageId);
    }

    // ----------------------------------------------------------------
    // AI Service call
    // ----------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private String callAiService(String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("question", message);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/ai/query", entity, Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object answer = response.getBody().get("answer");
                if (answer != null) return answer.toString();
            }
        } catch (Exception e) {
            log.warn("AI service unavailable, using fallback: {}", e.getMessage());
        }
        return buildFallbackResponse(message);
    }

    private String buildFallbackResponse(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("document") || lower.contains("upload"))
            return "You can upload documents in the Documents section. Supported: PDF, DOCX, TXT, PNG, JPG (max 50 MB).";
        if (lower.contains("hr") || lower.contains("leave") || lower.contains("vacation"))
            return "For HR queries, please check the Knowledge Base for the latest policies on leave, benefits, and onboarding.";
        if (lower.contains("it") || lower.contains("password") || lower.contains("support"))
            return "For IT support, please submit a ticket through the IT Service Desk or search the IT category in the Knowledge Base.";
        if (lower.contains("finance") || lower.contains("expense") || lower.contains("invoice"))
            return "Finance-related documents and policies are available in the Finance category of the Knowledge Base.";
        return "I'm your Enterprise AI assistant. The AI service is currently initialising. "
                + "Meanwhile, you can browse the Knowledge Base for answers to common questions.";
    }
}
