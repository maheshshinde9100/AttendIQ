package com.mahesh.attendiq.notifications.repository;

import com.mahesh.attendiq.notifications.entity.NotificationEntity;
import com.mahesh.attendiq.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserOrderByCreatedAtDesc(UserEntity user);
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}
