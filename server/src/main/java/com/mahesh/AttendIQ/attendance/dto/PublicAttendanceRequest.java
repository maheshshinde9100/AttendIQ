package com.mahesh.attendiq.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicAttendanceRequest {
    private String faceImage;  // Base64 encoded image
    private String location;
    private String deviceId;
}
