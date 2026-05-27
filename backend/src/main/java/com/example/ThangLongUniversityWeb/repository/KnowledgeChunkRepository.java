package com.example.ThangLongUniversityWeb.repository;

import com.example.ThangLongUniversityWeb.entity.KnowledgeChunk;
import com.example.ThangLongUniversityWeb.entity.KnowledgeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, Long> {

    List<KnowledgeChunk> findByDocumentOrderByChunkIndexAsc(KnowledgeDocument document);

    void deleteByDocument(KnowledgeDocument document);

    /**
     * Load all active chunks with their embeddings for in-memory cosine similarity retrieval.
     */
    @Query("SELECT c FROM KnowledgeChunk c JOIN FETCH c.document d WHERE d.isActive = true AND c.embedding IS NOT NULL")
    List<KnowledgeChunk> findAllActiveWithEmbeddings();

    long countByDocument(KnowledgeDocument document);
}
