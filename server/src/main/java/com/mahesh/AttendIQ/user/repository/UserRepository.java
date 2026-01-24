package com.mahesh.attendiq.user.repository;
import com.mahesh.attendiq.user.entity.UserEntity;
import java.util.Optional;

public class UserRepository extends JpaRepository<UserEntity,Long>{
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}