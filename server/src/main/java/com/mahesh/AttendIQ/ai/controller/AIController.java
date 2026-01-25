package com.mahesh.attendiq.ai.controller;

import com.mahesh.attendiq.ai.entity.AIAuditLogEntity;
import com.mahesh.attendiq.ai.service.AIService;
import com.mahesh.attendiq.common.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/analyze")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse<String>> analyzeTrends(@RequestBody String prompt) {
        String analysis = aiService.analyzeAttendanceTrends(prompt);
        return ResponseEntity.ok(ApiResponse.success(analysis, "AI analysis completed"));
    }

    @GetMapping("/logs/flagged")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AIAuditLogEntity>>> getFlaggedLogs() {
        return ResponseEntity.ok(ApiResponse.success(aiService.getFlaggedLogs(), "Flagged AI audit logs fetched"));
    }
}
