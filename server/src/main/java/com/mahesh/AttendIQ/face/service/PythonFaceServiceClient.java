package com.mahesh.attendiq.face.service;

import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@Service
public class PythonFaceServiceClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_SERVICE_URL = "http://localhost:5000/extract-embedding";

    public double[] extractEmbedding(String base64Image) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("image_data", base64Image);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            PythonResponse response = restTemplate.postForObject(PYTHON_SERVICE_URL, request, PythonResponse.class);
            
            if (response != null && response.isSuccess()) {
                return response.getEmbedding();
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error calling Python face service: " + e.getMessage());
            return null;
        }
    }

    @Data
    public static class PythonResponse {
        private boolean success;
        private String message;
        private double[] embedding;
    }
}
