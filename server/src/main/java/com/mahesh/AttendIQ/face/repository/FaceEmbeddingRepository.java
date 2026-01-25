package com.mahesh.attendiq.face.repository;

import com.mahesh.attendiq.face.entity.FaceEmbeddingEntity;
import com.mahesh.attendiq.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FaceEmbeddingRepository extends JpaRepository<FaceEmbeddingEntity, Long> {
    Optional<FaceEmbeddingEntity> findByUser(UserEntity user);
    Optional<FaceEmbeddingEntity> findByUserId(Long userId);
}
