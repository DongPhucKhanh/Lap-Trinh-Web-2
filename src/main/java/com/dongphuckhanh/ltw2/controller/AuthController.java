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
import com.dongphuckhanh.ltw2.service.EmailService;
import com.dongphuckhanh.ltw2.service.OtpService;

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

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpService otpService;

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

            // Chặn đăng nhập nếu ROLE_USER chưa xác thực (status = 0)
            // Tài khoản ROLE_ADMIN không cần xác thực OTP
            if (user.getStatus() != null && user.getStatus() == 0
                    && user.getRoles() != null && !user.getRoles().contains("ROLE_ADMIN")) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để lấy mã OTP!"));
            }

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getName(),
                    user.getEmail(),
                    user.getRoles(),
                    user.getAvatar()
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
        user.setStatus(0); // Chưa kích hoạt

        User savedUser = userRepository.save(user);

        // Gửi OTP xác thực qua email
        if (registerRequest.getEmail() != null && !registerRequest.getEmail().isBlank()) {
            String otp = otpService.generateOtp(registerRequest.getEmail());
            emailService.sendRegistrationOtp(registerRequest.getEmail(), otp);
        }

        return ResponseEntity.ok(Map.of(
                "message", "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP xác thực tài khoản.",
                "userId", savedUser.getId(),
                "username", savedUser.getUsername()
        ));
    }

    // ================================================================
    // XÁC THỰC TÀI KHOẢN (OTP)
    // POST /api/auth/verify-account
    // Body: { "email": "...", "otp": "..." }
    // ================================================================
    @PostMapping("/verify-account")
    public ResponseEntity<?> verifyAccount(@RequestBody com.dongphuckhanh.ltw2.dto.OtpVerifyRequest request) {
        String email = request.getEmail();
        String otp = request.getOtp();

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu thông tin email hoặc mã OTP."));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy tài khoản với email này."));
        }

        if (user.getStatus() != null && user.getStatus() == 1) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tài khoản này đã được xác thực trước đó."));
        }

        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            user.setStatus(1);
            userRepository.save(user);
            otpService.clearOtp(email);
            return ResponseEntity.ok(Map.of("message", "Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã OTP không hợp lệ hoặc đã hết hạn."));
        }
    }

    // ================================================================
    // GỬI LẠI OTP XÁC THỰC TÀI KHOẢN
    // POST /api/auth/resend-otp
    // Body: { "email": "..." }
    // ================================================================
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody com.dongphuckhanh.ltw2.dto.OtpRequest request) {
        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không được để trống!"));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy tài khoản với email này."));
        }

        try {
            String otp = otpService.generateOtp(email);
            emailService.sendRegistrationOtp(email, otp);
            return ResponseEntity.ok(Map.of("message", "Mã OTP mới đã được gửi đến email của bạn."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi gửi email OTP. Vui lòng thử lại sau."));
        }
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
                .<ResponseEntity<?>>map(user -> {
                    java.util.Map<String, Object> response = new java.util.HashMap<>();
                    response.put("id", user.getId());
                    response.put("username", user.getUsername());
                    response.put("name", user.getName());
                    response.put("email", user.getEmail());
                    response.put("phone", user.getPhone());
                    response.put("address", user.getAddress());
                    response.put("gender", user.getGender());
                    response.put("roles", user.getRoles());
                    response.put("status", user.getStatus());
                    response.put("avatar", user.getAvatar());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ================================================================
    // QUÊN MẬT KHẨU - YÊU CẦU OTP
    // POST /api/auth/forgot-password/request
    // Body: { "email": "..." }
    // ================================================================
    @PostMapping("/forgot-password/request")
    public ResponseEntity<?> requestOtp(@RequestBody com.dongphuckhanh.ltw2.dto.OtpRequest request) {
        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không được để trống!"));
        }
        
        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy tài khoản với email này!"));
        }

        try {
            String otp = otpService.generateOtp(email);
            emailService.sendForgotPasswordOtp(email, otp);
            return ResponseEntity.ok(Map.of("message", "Mã OTP đã được gửi đến email của bạn."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi gửi email OTP. Vui lòng thử lại sau."));
        }
    }

    // ================================================================
    // QUÊN MẬT KHẨU - XÁC THỰC OTP
    // POST /api/auth/forgot-password/verify
    // Body: { "email": "...", "otp": "..." }
    // ================================================================
    @PostMapping("/forgot-password/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody com.dongphuckhanh.ltw2.dto.OtpVerifyRequest request) {
        String email = request.getEmail();
        String otp = request.getOtp();
        
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu thông tin email hoặc mã OTP."));
        }

        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "Xác thực OTP thành công."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã OTP không hợp lệ hoặc đã hết hạn."));
        }
    }

    // ================================================================
    // QUÊN MẬT KHẨU - ĐẶT LẠI MẬT KHẨU
    // POST /api/auth/forgot-password/reset
    // Body: { "email": "...", "newPassword": "..." }
    // ================================================================
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody com.dongphuckhanh.ltw2.dto.ResetPasswordRequest request) {
        String email = request.getEmail();
        String newPassword = request.getNewPassword();

        if (email == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu thông tin email hoặc mật khẩu mới."));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy người dùng."));
        }

        // Lưu mật khẩu mới đã mã hóa
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Xóa OTP khỏi bộ nhớ
        otpService.clearOtp(email);

        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay."));
    }
}