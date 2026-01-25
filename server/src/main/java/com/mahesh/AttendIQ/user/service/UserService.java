package com.mahesh.attendiq.user.service;

import com.mahesh.attendiq.user.entity.UserEntity;
import com.mahesh.attendiq.user.repository.UserRepository;
import com.mahesh.attendiq.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public UserEntity createUser(UserEntity user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }


    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void updateUserFaceRegistered(Long userId, boolean registered) {
        UserEntity user = getUserById(userId);
        user.setFaceRegistered(registered);
        userRepository.save(user);
    }
}
