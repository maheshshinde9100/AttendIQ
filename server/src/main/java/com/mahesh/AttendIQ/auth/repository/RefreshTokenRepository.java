package com.mahesh.attendiq.auth.repository;

import com.mahesh.attendiq.auth.entity.RefreshTokenEntity;
import com.mahesh.attendiq.auth.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);
}
