package com.mahesh.attendiq.face.dto;

import lombok.Data;

@Data
public class FaceEmbeddingRequest {
    private double[] embedding;
}
