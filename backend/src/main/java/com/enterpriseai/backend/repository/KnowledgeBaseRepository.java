package com.enterpriseai.backend.repository;

import com.enterpriseai.backend.entity.KnowledgeBase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, String> {

    Page<KnowledgeBase> findAll(Pageable pageable);

    List<KnowledgeBase> findByCategoryIgnoreCase(String category);

    Page<KnowledgeBase> findByCategoryIgnoreCase(String category, Pageable pageable);

    List<KnowledgeBase> findAllByOrderByUpdatedAtDesc();
}
