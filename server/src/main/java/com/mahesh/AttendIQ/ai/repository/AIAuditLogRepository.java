package com.mahesh.attendiq.ai.repository;

import com.mahesh.attendiq.ai.entity.AIAuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIAuditLogRepository extends JpaRepository<AIAuditLogEntity, Long> {
    List<AIAuditLogEntity> findByFlaggedTrue();
    List<AIAuditLogEntity> findByUserId(Long userId);
}
