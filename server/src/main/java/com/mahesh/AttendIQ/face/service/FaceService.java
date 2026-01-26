package com.mahesh.attendiq.face.service;

import com.mahesh.attendiq.face.entity.FaceEmbeddingEntity;
import com.mahesh.attendiq.face.repository.FaceEmbeddingRepository;
import com.mahesh.attendiq.user.entity.UserEntity;
import com.mahesh.attendiq.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FaceService {

    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final UserService userService;

    @Transactional
    public FaceEmbeddingEntity saveEmbedding(Long userId, double[] embedding) {
        UserEntity user = userService.getUserById(userId);
        
        FaceEmbeddingEntity faceEmbedding = faceEmbeddingRepository.findByUser(user)
                .orElse(FaceEmbeddingEntity.builder().user(user).build());
        
        faceEmbedding.setEmbedding(embedding);
        FaceEmbeddingEntity saved = faceEmbeddingRepository.save(faceEmbedding);
        
        userService.updateUserFaceRegistered(userId, true);
        return saved;
    }

    public Optional<FaceEmbeddingEntity> getEmbeddingByUserId(Long userId) {
        return faceEmbeddingRepository.findByUserId(userId);
    }

    public double verifyFace(Long userId, double[] incomingEmbedding) {
        return faceEmbeddingRepository.findByUserId(userId)
                .map(stored -> calculateSimilarity(stored.getEmbedding(), incomingEmbedding))
                .orElse(0.0);
    }
    
    public double calculateSimilarity(double[] e1, double[] e2) {

        // Simple Cosine Similarity or Euclidean distance logic
        if (e1.length != e2.length) return 0.0;
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < e1.length; i++) {
            dotProduct += e1[i] * e2[i];
            normA += Math.pow(e1[i], 2);
            normB += Math.pow(e2[i], 2);
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Find user by comparing face embedding with all registered users.
     * Returns the best matching user if similarity is above threshold.
     */
    public Optional<UserEntity> findUserByFaceEmbedding(double[] incomingEmbedding) {
        var allEmbeddings = faceEmbeddingRepository.findAll();
        
        UserEntity bestMatch = null;
        double highestSimilarity = 0.0;
        double threshold = 0.75; // Minimum similarity threshold
        
        for (FaceEmbeddingEntity stored : allEmbeddings) {
            double similarity = calculateSimilarity(stored.getEmbedding(), incomingEmbedding);
            if (similarity > highestSimilarity && similarity >= threshold) {
                highestSimilarity = similarity;
                bestMatch = stored.getUser();
            }
        }
        
        return Optional.ofNullable(bestMatch);
    }
    
    /**
     * Find user and return with confidence score
     */
    public FaceMatchResult findUserWithConfidence(double[] incomingEmbedding) {
        var allEmbeddings = faceEmbeddingRepository.findAll();
        
        UserEntity bestMatch = null;
        double highestSimilarity = 0.0;
        double threshold = 0.75;
        
        for (FaceEmbeddingEntity stored : allEmbeddings) {
            double similarity = calculateSimilarity(stored.getEmbedding(), incomingEmbedding);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                if (similarity >= threshold) {
                    bestMatch = stored.getUser();
                }
            }
        }
        
        return new FaceMatchResult(bestMatch, highestSimilarity);
    }
    
    public record FaceMatchResult(UserEntity user, double confidence) {}
}

