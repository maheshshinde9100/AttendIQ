package com.mahesh.attendiq.ai.service;

import com.mahesh.attendiq.ai.entity.AIAuditLogEntity;
import com.mahesh.attendiq.ai.repository.AIAuditLogRepository;
import com.mahesh.attendiq.user.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AIService {

    private final OllamaChatModel chatModel;
    private final AIAuditLogRepository auditLogRepository;

    public String analyzeAttendanceTrends(String prompt) {
        return chatModel.call(prompt);
    }

    public void logAIAction(UserEntity user, String action, String details, Double confidence, boolean flagged) {
        AIAuditLogEntity log = AIAuditLogEntity.builder()
                .user(user)
                .action(action)
                .details(details)
                .confidenceScore(confidence)
                .flagged(flagged)
                .build();
        auditLogRepository.save(log);
    }

    public List<AIAuditLogEntity> getFlaggedLogs() {
        return auditLogRepository.findByFlaggedTrue();
    }
}
