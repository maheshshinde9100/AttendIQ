package com.mahesh.attendiq.attendance.repository;

import com.mahesh.attendiq.attendance.entity.AttendanceEntity;
import com.mahesh.attendiq.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceEntity, Long> {
    List<AttendanceEntity> findByUser(UserEntity user);
    List<AttendanceEntity> findByUserId(Long userId);
    List<AttendanceEntity> findByAttendanceDateBetween(LocalDateTime start, LocalDateTime end);
}

