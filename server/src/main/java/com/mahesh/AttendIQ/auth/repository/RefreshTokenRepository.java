package com.mahesh.attendiq.auth.repository;

import com.mahesh.attendiq.auth.entity.RefreshTokenEntity;
import com.mahesh.attendiq.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {
    Optional<RefreshTokenEntity> findByToken(String token);
    
    @Modifying
    int deleteByUser(UserEntity user);

    @Modifying
    int deleteByUserId(Long userId);
}
