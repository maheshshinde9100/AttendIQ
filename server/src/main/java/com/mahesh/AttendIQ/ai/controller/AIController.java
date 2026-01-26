package com.mahesh.attendiq.ai.controller;

import com.mahesh.attendiq.ai.entity.AIAuditLogEntity;
import com.mahesh.attendiq.ai.service.AIService;
import com.mahesh.attendiq.attendance.service.AttendanceService;
import com.mahesh.attendiq.common.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final AttendanceService attendanceService;

    @GetMapping("/analyze-today")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse<String>> analyzeTodayTrends() {
        try {
            var todayData = attendanceService.getAllAttendanceForToday();
            if (todayData.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success("No attendance data found for today to analyze.", "AI Analysis skipped"));
            }
            // Convert to summary or JSON for the AI
            String analysis = aiService.analyzeAttendanceTrends(todayData.toString());
            return ResponseEntity.ok(ApiResponse.success(analysis, "AI analysis of today's attendance completed"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("AI Service Error: " + e.getMessage()));
        }
    }


    @GetMapping("/logs/flagged")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AIAuditLogEntity>>> getFlaggedLogs() {
        return ResponseEntity.ok(ApiResponse.success(aiService.getFlaggedLogs(), "Flagged AI audit logs fetched"));
    }
}
