package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.dto.JwtResponse;
import com.dongphuckhanh.ltw2.dto.LoginRequest;
import com.dongphuckhanh.ltw2.dto.RegisterRequest;
import com.dongphuckhanh.ltw2.entity.User;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import com.dongphuckhanh.ltw2.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // ================================================================
    // ĐĂNG NHẬP
    // POST /api/auth/login
    // Body: { "username": "admin", "password": "123456" }
    // ================================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Kiểm tra username/password trống
        if (loginRequest.getUsername() == null || loginRequest.getUsername().isBlank()
                || loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Username và password không được để trống!"));
        }

        try {
            // Dùng AuthenticationManager để xác thực => Spring Security sẽ gọi
            // UserDetailsServiceImpl.loadUserByUsername() và so sánh password BCrypt
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // Đặt thông tin xác thực vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Sinh JWT token
            String jwt = jwtUtils.generateTokenFromUsername(loginRequest.getUsername());

            // Lấy thông tin user từ DB để trả về response đầy đủ
            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getName(),
                    user.getEmail(),
                    user.getRoles()
            ));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Sai tên đăng nhập hoặc mật khẩu!"));
        } catch (Exception e) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Tài khoản bị khóa hoặc không tồn tại!"));
        }
    }

    // ================================================================
    // ĐĂNG KÝ
    // POST /api/auth/register
    // Body: { "name": "...", "username": "...", "password": "...", "email": "..." }
    // ================================================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        // Kiểm tra các trường bắt buộc
        if (registerRequest.getUsername() == null || registerRequest.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username không được để trống!"));
        }
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password không được để trống!"));
        }
        if (registerRequest.getName() == null || registerRequest.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Họ tên không được để trống!"));
        }

        // Kiểm tra username đã tồn tại chưa
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Username '" + registerRequest.getUsername() + "' đã được sử dụng!"));
        }

        // Kiểm tra email đã tồn tại chưa (nếu có)
        if (registerRequest.getEmail() != null && !registerRequest.getEmail().isBlank()
                && userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email '" + registerRequest.getEmail() + "' đã được sử dụng!"));
        }

        // Tạo user mới — password phải được mã hóa BCrypt trước khi lưu
        User user = new User();
        user.setName(registerRequest.getName());
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setGender(registerRequest.getGender());
        user.setRoles("ROLE_USER"); // Mặc định tất cả user mới là ROLE_USER

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Đăng ký thành công!",
                "userId", savedUser.getId(),
                "username", savedUser.getUsername()
        ));
    }

    // ================================================================
    // ĐĂNG KÝ QUẢN TRỊ VIÊN (Dành cho tạo Admin trực tiếp trên Swagger)
    // POST /api/auth/register-admin
    // Body: { "name": "...", "username": "...", "password": "...", "email": "..." }
    // ================================================================
    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterRequest registerRequest) {
        if (registerRequest.getUsername() == null || registerRequest.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username không được để trống!"));
        }
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password không được để trống!"));
        }
        if (registerRequest.getName() == null || registerRequest.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Họ tên không được để trống!"));
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username '" + registerRequest.getUsername() + "' đã được sử dụng!"));
        }

        User user = new User();
        user.setName(registerRequest.getName());
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setGender(registerRequest.getGender());
        user.setRoles("ROLE_ADMIN"); // Cấp quyền Quản trị viên

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Đã tạo tài khoản Admin thành công!",
                "userId", savedUser.getId(),
                "username", savedUser.getUsername()
        ));
    }

    // ================================================================
    // LẤY THÔNG TIN USER ĐANG ĐĂNG NHẬP
    // GET /api/auth/me   (cần Bearer Token)
    // ================================================================
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập!"));
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "name", user.getName(),
                        "email", user.getEmail() != null ? user.getEmail() : "",
                        "roles", user.getRoles(),
                        "status", user.getStatus()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}