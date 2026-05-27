package com.example.ThangLongUniversityWeb.service;

import com.example.ThangLongUniversityWeb.entity.KnowledgeChunk;
import com.example.ThangLongUniversityWeb.repository.KnowledgeChunkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Retrieves the most relevant knowledge chunks for a given query using
 * in-memory cosine similarity.
 *
 * Truth-hierarchy re-ranking:
 *   Priority 1 (new announcements) → weight 1.0
 *   Priority 2 (department pages)  → weight 0.9
 *   Priority 3 (program pages)     → weight 0.8
 *   Priority 4 (student handbook)  → weight 0.7
 *   Priority 5 (Wikipedia)         → weight 0.5
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RetrieverService {

    private static final double[] PRIORITY_WEIGHTS = {0, 1.0, 0.9, 0.8, 0.7, 0.5};

    private final KnowledgeChunkRepository chunkRepository;
    private final EmbeddingService embeddingService;

    /**
     * Retrieve top-K most relevant chunks for the query.
     * Returns empty list if embedding fails or no chunks are indexed.
     */
    public List<KnowledgeChunk> retrieve(String query, int topK) {
        float[] queryEmbedding = embeddingService.embed(query);
        if (queryEmbedding == null) {
            log.warn("Embedding failed for query, skipping RAG retrieval.");
            return List.of();
        }

        List<KnowledgeChunk> allChunks = chunkRepository.findAllActiveWithEmbeddings();
        if (allChunks.isEmpty()) return List.of();

        List<ScoredChunk> scored = new ArrayList<>();
        for (KnowledgeChunk chunk : allChunks) {
            float[] chunkEmb = EmbeddingService.fromJson(chunk.getEmbedding());
            if (chunkEmb == null || chunkEmb.length != queryEmbedding.length) continue;

            double cosine = cosineSimilarity(queryEmbedding, chunkEmb);
            int priority = chunk.getDocument().getPriority();
            double weight = (priority >= 1 && priority <= 5) ? PRIORITY_WEIGHTS[priority] : 0.7;
            double score = cosine * weight;
            scored.add(new ScoredChunk(chunk, score));
        }

        scored.sort(Comparator.comparingDouble(ScoredChunk::score).reversed());
        return scored.stream()
                .limit(topK)
                .map(ScoredChunk::chunk)
                .toList();
    }

    /**
     * Build a context string from retrieved chunks, formatted for the system prompt.
     */
    public String buildContext(List<KnowledgeChunk> chunks) {
        if (chunks.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (KnowledgeChunk c : chunks) {
            sb.append("Nguồn: ").append(c.getDocument().getTitle()).append("\n");
            sb.append(c.getContent()).append("\n---\n");
        }
        return sb.toString().strip();
    }

    private static double cosineSimilarity(float[] a, float[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot   += (double) a[i] * b[i];
            normA += (double) a[i] * a[i];
            normB += (double) b[i] * b[i];
        }
        double denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom == 0 ? 0 : dot / denom;
    }

    private record ScoredChunk(KnowledgeChunk chunk, double score) {}
}
