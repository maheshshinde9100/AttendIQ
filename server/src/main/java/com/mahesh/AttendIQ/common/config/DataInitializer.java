package com.mahesh.attendiq.common.config;

import com.mahesh.attendiq.user.entity.UserEntity;
import com.mahesh.attendiq.user.entity.UserRole;
import com.mahesh.attendiq.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            UserEntity admin = UserEntity.builder()
                    .fullName("Admin User")
                    .email("admin@attendiq.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.ROLE_ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Default Admin User Created: admin@attendiq.com / admin123");
        }
    }
}
