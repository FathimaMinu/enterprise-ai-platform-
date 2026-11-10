package com.enterpriseai.backend.service;

import com.enterpriseai.backend.entity.KnowledgeBase;
import com.enterpriseai.backend.repository.KnowledgeBaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class KnowledgeBaseService {

    private final KnowledgeBaseRepository repo;

    public KnowledgeBaseService(KnowledgeBaseRepository repo) {
        this.repo = repo;
    }

    public Page<KnowledgeBase> list(String category, Pageable pageable) {
        if (category != null && !category.isBlank()) {
            return repo.findByCategoryIgnoreCase(category, pageable);
        }
        return repo.findAll(pageable);
    }

    public KnowledgeBase getById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));
    }

    @Transactional
    public KnowledgeBase create(KnowledgeBase article) {
        article.setId(null); // let JPA generate
        return repo.save(article);
    }

    @Transactional
    public KnowledgeBase update(String id, KnowledgeBase updates) {
        KnowledgeBase existing = getById(id);
        if (updates.getTitle()    != null) existing.setTitle(updates.getTitle());
        if (updates.getContent()  != null) existing.setContent(updates.getContent());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        return repo.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Article not found: " + id);
        }
        repo.deleteById(id);
    }

    @Transactional
    public KnowledgeBase incrementViews(String id) {
        KnowledgeBase article = getById(id);
        article.setViews(article.getViews() + 1);
        return repo.save(article);
    }
}
