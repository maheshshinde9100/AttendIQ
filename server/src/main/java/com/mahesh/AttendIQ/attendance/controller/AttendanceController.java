package com.mahesh.attendiq.attendance.controller;

import com.mahesh.attendiq.attendance.dto.MarkAttendanceRequest;
import com.mahesh.attendiq.attendance.entity.AttendanceEntity;
import com.mahesh.attendiq.attendance.service.AttendanceService;
import com.mahesh.attendiq.common.util.ApiResponse;
import com.mahesh.attendiq.user.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AIService aiService;
    private final FaceService faceService; // Added FaceService

    @PostMapping("/mark")
    public ResponseEntity<ApiResponse<AttendanceEntity>> markAttendance(
            @AuthenticationPrincipal UserEntity currentUser,
            @RequestBody MarkAttendanceRequest request
    ) {
        // Step 1: Real Face Verification
        double confidenceScore = 0.0;
        if (request.getFaceEmbedding() != null) {
            confidenceScore = faceService.verifyFace(currentUser.getId(), request.getFaceEmbedding());
        }

        // Step 2: Detect Fraud using AI logic (e.g. if confidence is too low)
        boolean isFraudulent = aiService.detectFraud(
                currentUser, 
                request.getDeviceId(), 
                request.getLocation(), 
                confidenceScore
        );

        // Step 3: Mark attendance
        AttendanceEntity attendance = attendanceService.markAttendance(
                currentUser.getId(),
                isFraudulent ? "FLAGGED" : request.getStatus(),
                request.getDeviceId(),
                request.getLocation(),
                confidenceScore > 0 ? "AI_FACE_VERIFIED" : "MANUAL"
        );
        
        String message = isFraudulent ? "Attendance marked but flagged for review (Confidence: " + String.format("%.2f", confidenceScore) + ")" 
                                     : "Attendance marked successfully (Confidence: " + String.format("%.2f", confidenceScore) + ")";
        
        return ResponseEntity.ok(ApiResponse.success(attendance, message));
    }


    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AttendanceEntity>>> getMyAttendance(@AuthenticationPrincipal UserEntity currentUser) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getUserAttendance(currentUser.getId()), "Attendance history fetched"));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceEntity>>> getUserAttendance(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getUserAttendance(userId), "User attendance history fetched"));
    }

    @GetMapping("/today")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceEntity>>> getTodayAttendance() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAllAttendanceForToday(), "Today's attendance report fetched"));
    }
}
