package com.mahesh.attendiq.common.service;

import com.mahesh.attendiq.ai.repository.AIAuditLogRepository;
import com.mahesh.attendiq.attendance.repository.AttendanceRepository;
import com.mahesh.attendiq.common.util.DashboardStats;
import com.mahesh.attendiq.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final AIAuditLogRepository aiAuditLogRepository;

    public DashboardStats getAdminStats() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

        long totalUsers = userRepository.count();
        long presentToday = attendanceRepository.findByAttendanceDateBetween(startOfDay, endOfDay).size();
        long flaggedLogs = aiAuditLogRepository.findByFlaggedTrue().size();

        return DashboardStats.builder()
                .totalStudents(totalUsers) // Simplified total count
                .presentToday(presentToday)
                .flaggedAttempts(flaggedLogs)
                .overallAttendanceRate(totalUsers > 0 ? (double) presentToday / totalUsers * 100 : 0)
                .build();
    }
}
