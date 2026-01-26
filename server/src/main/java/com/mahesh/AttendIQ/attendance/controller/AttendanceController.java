package com.mahesh.attendiq.attendance.controller;

import com.mahesh.attendiq.attendance.dto.MarkAttendanceRequest;
import com.mahesh.attendiq.attendance.entity.AttendanceEntity;
import com.mahesh.attendiq.attendance.service.AttendanceService;
import com.mahesh.attendiq.ai.service.AIService;
import com.mahesh.attendiq.face.service.FaceService;
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

    /**
     * Public endpoint for kiosk-based attendance (no authentication required).
     * The face image is processed to extract embedding and matched against stored embeddings.
     * 
     * NOTE: In a production environment, you would call a Python microservice 
     * to extract the face embedding from the image. For now, we simulate this.
     */
    @PostMapping("/public/mark")
    public ResponseEntity<ApiResponse<com.mahesh.attendiq.attendance.dto.PublicAttendanceResponse>> markPublicAttendance(
            @RequestBody com.mahesh.attendiq.attendance.dto.PublicAttendanceRequest request
    ) {
        try {
            // In production: Call Python microservice to extract face embedding from request.getFaceImage()
            // For now, we return an error message instructing to use the Python client
            
            // Placeholder: This would be the embedding extracted from the image
            // double[] extractedEmbedding = pythonFaceService.extractEmbedding(request.getFaceImage());
            
            // Since we can't extract embedding from image in Java easily,
            // we'll return a message directing users to the Python client
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Face recognition from browser is not yet supported. Please use the Python client for biometric attendance, or contact your administrator to register your face first.")
            );
            
            /* Production implementation would be:
            var matchResult = faceService.findUserWithConfidence(extractedEmbedding);
            
            if (matchResult.user() == null) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Face not recognized. Please ensure you have registered your face.")
                );
            }
            
            // Check if already marked today
            var todayRecords = attendanceService.getUserAttendance(matchResult.user().getId());
            var today = java.time.LocalDate.now();
            boolean alreadyMarked = todayRecords.stream()
                .anyMatch(a -> a.getAttendanceDate().toLocalDate().equals(today));
            
            if (alreadyMarked) {
                return ResponseEntity.ok(ApiResponse.success(
                    PublicAttendanceResponse.fromUser(matchResult.user(), null, "ALREADY_MARKED", java.time.LocalDateTime.now(), request.getLocation(), "SYSTEM"),
                    "Attendance already marked for today"
                ));
            }
            
            // Mark attendance
            AttendanceEntity attendance = attendanceService.markAttendance(
                matchResult.user().getId(),
                matchResult.confidence() >= 0.85 ? "PRESENT" : "FLAGGED",
                request.getDeviceId(),
                request.getLocation(),
                "AI_KIOSK_VERIFIED"
            );
            
            return ResponseEntity.ok(ApiResponse.success(
                PublicAttendanceResponse.fromUser(matchResult.user(), attendance.getId(), attendance.getStatus(), attendance.getAttendanceDate(), attendance.getLocation(), attendance.getVerifiedBy()),
                "Attendance marked successfully! Confidence: " + String.format("%.1f%%", matchResult.confidence() * 100)
            ));
            */
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                ApiResponse.error("Error processing attendance: " + e.getMessage())
            );
        }
    }
}

