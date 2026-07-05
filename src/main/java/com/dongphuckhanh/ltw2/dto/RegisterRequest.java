package com.dongphuckhanh.ltw2.dto;

/**
 * DTO nhận dữ liệu từ request đăng ký tài khoản mới.
 */
public class RegisterRequest {
    private String name;
    private String username;
    private String password;
    private String email;
    private String phone;
    private String gender;
    private String address;

    public RegisterRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}
