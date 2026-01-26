package com.mahesh.attendiq.attendance.entity;

import com.mahesh.attendiq.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "attendance_date", nullable = false)
    private LocalDateTime attendanceDate;

    @Column(name = "status", nullable = false)
    private String status; // PRESENT, LATE, ABSENT

    @Column(name = "device_id")
    private String deviceId;

    @Column(name = "location")
    private String location;

    @Column(name = "verified_by")
    private String verifiedBy; // AI, MANUAL

    @PrePersist
    protected void onCreate() {
        if (this.attendanceDate == null) {
            this.attendanceDate = LocalDateTime.now();
        }
    }
}

