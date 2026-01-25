package com.mahesh.attendiq.common.util;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
    private long totalStudents;
    private long totalTeachers;
    private long presentToday;
    private long absentToday;
    private long flaggedAttempts;
    private double overallAttendanceRate;
}
