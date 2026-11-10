package com.enterpriseai.backend.controller;

import com.enterpriseai.backend.entity.KnowledgeBase;
import com.enterpriseai.backend.service.KnowledgeBaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/knowledge-base")
public class KnowledgeBaseController {

    private final KnowledgeBaseService service;

    public KnowledgeBaseController(KnowledgeBaseService service) {
        this.service = service;
    }

    /** GET /api/knowledge-base?category=HR&page=0&size=20 */
    @GetMapping
    public ResponseEntity<Page<KnowledgeBase>> list(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        return ResponseEntity.ok(service.list(category, pageable));
    }

    /** GET /api/knowledge-base/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeBase> getById(@PathVariable String id) {
        KnowledgeBase article = service.getById(id);
        service.incrementViews(id);
        return ResponseEntity.ok(article);
    }

    /** POST /api/knowledge-base */
    @PostMapping
    public ResponseEntity<KnowledgeBase> create(@RequestBody KnowledgeBase article) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(article));
    }

    /** PUT /api/knowledge-base/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeBase> update(@PathVariable String id,
                                                @RequestBody KnowledgeBase updates) {
        return ResponseEntity.ok(service.update(id, updates));
    }

    /** DELETE /api/knowledge-base/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
