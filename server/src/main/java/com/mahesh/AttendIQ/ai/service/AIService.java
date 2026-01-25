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

    /**
     * Uses Ollama to analyze attendance trends across a group of data.
     */
    public String analyzeAttendanceTrends(String attendanceDataJson) {
        String prompt = "Act as an academic attendance analyst. Analyze the following attendance data (in JSON format) " +
                "and provide insights on student engagement, absenteeism patterns, and specific students at risk. " +
                "Data: " + attendanceDataJson;
        return chatModel.call(prompt);
    }

    /**
     * Logic to determine if an attendance mark attempt is likely fraudulent.
     */
    public boolean detectFraud(UserEntity user, String deviceId, String location, double confidenceScore) {
        // AI-based reasoning for fraud detection
        boolean isFlagged = false;
        String details = "Verified by AI";

        if (confidenceScore < 0.85) {
            isFlagged = true;
            details = "Low face verification confidence: " + confidenceScore;
        }

        // Potential logic: Compare current location/device with history
        // (Placeholder for more complex logic)

        logAIAction(user, "FRAUD_DETECTION", details, confidenceScore, isFlagged);
        return isFlagged;
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

