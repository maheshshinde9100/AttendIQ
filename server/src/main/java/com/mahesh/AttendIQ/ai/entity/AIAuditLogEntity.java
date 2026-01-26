package com.mahesh.attendiq.ai.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mahesh.attendiq.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AIAuditLogEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(nullable = false)
    private String action; // FACE_VERIFICATION, FRAUD_DETECTION

    @Column(length = 2000)
    private String details;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Builder.Default
    @Column(name = "is_flagged")
    private boolean flagged = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
