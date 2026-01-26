package com.mahesh.attendiq.attendance.dto;

import com.mahesh.attendiq.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicAttendanceResponse {
    private Long attendanceId;
    private String fullName;
    private String email;
    private String status;
    private LocalDateTime attendanceDate;
    private String location;
    private String verifiedBy;
    
    public static PublicAttendanceResponse fromUser(UserEntity user, Long attendanceId, String status, LocalDateTime time, String location, String verifiedBy) {
        return PublicAttendanceResponse.builder()
                .attendanceId(attendanceId)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(status)
                .attendanceDate(time)
                .location(location)
                .verifiedBy(verifiedBy)
                .build();
    }
}
