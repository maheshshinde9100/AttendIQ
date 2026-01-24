package com.mahesh.attendiq.attendance.repository;

import com.mahesh.attendiq.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findBySessionId(Long sessionId);
    Optional<Attendance> findByStudentIdAndSessionIdAndDate(Long studentId, Long sessionId, LocalDate date);
}
