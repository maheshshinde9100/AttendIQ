package com.mahesh.attendiq.notifications.controller;

import com.mahesh.attendiq.common.util.ApiResponse;
import com.mahesh.attendiq.notifications.entity.NotificationEntity;
import com.mahesh.attendiq.notifications.service.NotificationService;
import com.mahesh.attendiq.user.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationEntity>>> getMyNotifications(@AuthenticationPrincipal UserEntity currentUser) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(currentUser.getId()), "Notifications fetched"));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }
}
