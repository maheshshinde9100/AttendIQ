package com.mahesh.attendiq.face.repository;

import com.mahesh.attendiq.face.entity.FaceEmbeddingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaceEmbeddingRepository extends JpaRepository<FaceEmbeddingEntity, Long> {
    List<FaceEmbeddingEntity> findByStudentId(Long studentId);
}

