package com.dongphuckhanh.ltw2.config;

import com.dongphuckhanh.ltw2.entity.User;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Tìm admin, nếu chưa có thì tạo mới
        User admin = userRepository.findByUsername("admin").orElse(new User());
        
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("123456"));
        admin.setName("Quản trị viên hệ thống");
        if (admin.getEmail() == null) {
            admin.setEmail("admin@dongphuckhanh.com");
        }
        admin.setRoles("ROLE_ADMIN");
        admin.setStatus(1);
        userRepository.save(admin);
        
        System.out.println("==========================================================");
        System.out.println(" Đã CẬP NHẬT/TẠO MỚI tài khoản Admin mặc định:");
        System.out.println(" Username: admin");
        System.out.println(" Password: 123456");
        System.out.println("==========================================================");
    }
}
