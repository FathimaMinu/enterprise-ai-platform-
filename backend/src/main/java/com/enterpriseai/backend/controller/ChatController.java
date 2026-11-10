package com.enterpriseai.backend.controller;

import com.enterpriseai.backend.dto.ChatRequest;
import com.enterpriseai.backend.dto.ChatResponse;
import com.enterpriseai.backend.entity.ChatMessage;
import com.enterpriseai.backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /** GET /api/chat/messages — returns messages for the authenticated user */
    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(chatService.getMessages(principal.getUsername()));
    }

    /** POST /api/chat/message — send a message, receive AI response */
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails principal) {

        ChatMessage saved = chatService.sendMessage(principal.getUsername(), request.getMessage());
        ChatResponse response = new ChatResponse(
                saved.getResponse(),
                saved.getId(),
                saved.getCreatedAt()
        );
        return ResponseEntity.ok(response);
    }

    /** DELETE /api/chat/{messageId} — delete a specific message */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String messageId) {
        chatService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }
}
