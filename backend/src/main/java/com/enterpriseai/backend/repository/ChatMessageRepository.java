package com.enterpriseai.backend.repository;

import com.enterpriseai.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {

    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserId(String userId);

    @Query("SELECT FUNCTION('DAYNAME', cm.createdAt) as day, COUNT(cm) as queries " +
           "FROM ChatMessage cm " +
           "WHERE cm.createdAt >= :startDate " +
           "GROUP BY FUNCTION('DAYNAME', cm.createdAt) " +
           "ORDER BY MIN(cm.createdAt)")
    List<Map<String, Object>> countQueriesByDay(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT u.department as name, COUNT(cm) as value " +
           "FROM ChatMessage cm " +
           "JOIN User u ON cm.userId = u.id " +
           "WHERE u.department IS NOT NULL " +
           "GROUP BY u.department " +
           "ORDER BY COUNT(cm) DESC")
    List<Map<String, Object>> countQueriesByDepartment();
}
