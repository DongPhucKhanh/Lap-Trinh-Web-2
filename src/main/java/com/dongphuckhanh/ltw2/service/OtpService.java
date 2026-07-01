package com.dongphuckhanh.ltw2.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    // In-memory store cho OTP (Email -> OTP)
    // Trong thực tế nên dùng Redis hoặc DB với thời hạn (TTL)
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    /**
     * Tạo mã OTP ngẫu nhiên 6 chữ số
     */
    public String generateOtp(String email) {
        Random random = new Random();
        int otpValue = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpValue);
        
        // Lưu vào bộ nhớ tạm
        otpStorage.put(email, otp);
        
        return otp;
    }



    /**
     * Xác thực OTP
     */
    public boolean verifyOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            return true;
        }
        return false;
    }

    /**
     * Xóa OTP sau khi dùng xong
     */
    public void clearOtp(String email) {
        otpStorage.remove(email);
    }
}
