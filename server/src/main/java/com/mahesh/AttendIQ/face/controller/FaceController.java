package com.mahesh.attendiq.face.controller;

import com.mahesh.attendiq.common.util.ApiResponse;
import com.mahesh.attendiq.face.dto.FaceEmbeddingRequest;
import com.mahesh.attendiq.face.entity.FaceEmbeddingEntity;
import com.mahesh.attendiq.face.service.FaceService;
import com.mahesh.attendiq.user.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/face")
@RequiredArgsConstructor
public class FaceController {

    private final FaceService faceService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<FaceEmbeddingEntity>> registerFace(
            @AuthenticationPrincipal UserEntity currentUser,
            @RequestBody FaceEmbeddingRequest request
    ) {
        FaceEmbeddingEntity saved = faceService.saveEmbedding(currentUser.getId(), request.getEmbedding());
        return ResponseEntity.ok(ApiResponse.success(saved, "Face biometric registered successfully"));
    }

    @GetMapping("/my-embedding")
    public ResponseEntity<ApiResponse<FaceEmbeddingEntity>> getMyEmbedding(@AuthenticationPrincipal UserEntity currentUser) {
        return faceService.getEmbeddingByUserId(currentUser.getId())
                .map(e -> ResponseEntity.ok(ApiResponse.success(e, "Face embedding fetched")))
                .orElse(ResponseEntity.notFound().build());
    }
}
