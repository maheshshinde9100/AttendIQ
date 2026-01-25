package com.mahesh.attendiq.attendance.dto;

import lombok.Data;

@Data
public class MarkAttendanceRequest {
    private String status;
    private String deviceId;
    private String location;
    private String verifiedBy;
}
