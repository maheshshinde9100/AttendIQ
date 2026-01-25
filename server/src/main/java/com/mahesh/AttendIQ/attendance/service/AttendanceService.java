package com.mahesh.attendiq.attendance.service;

import com.mahesh.attendiq.attendance.entity.AttendanceEntity;
import com.mahesh.attendiq.attendance.repository.AttendanceRepository;
import com.mahesh.attendiq.user.entity.UserEntity;
import com.mahesh.attendiq.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserService userService;

    @Transactional
    public AttendanceEntity markAttendance(Long userId, String status, String deviceId, String location, String verifiedBy) {
        UserEntity user = userService.getUserById(userId);
        
        AttendanceEntity attendance = AttendanceEntity.builder()
                .user(user)
                .status(status)
                .deviceId(deviceId)
                .location(location)
                .verifiedBy(verifiedBy)
                .attendanceDate(LocalDateTime.now())
                .build();
                
        return attendanceRepository.save(attendance);
    }

    public List<AttendanceEntity> getUserAttendance(Long userId) {
        return attendanceRepository.findByUserId(userId);
    }

    public List<AttendanceEntity> getAllAttendanceForToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return attendanceRepository.findByAttendanceDateBetween(startOfDay, endOfDay);
    }
}
