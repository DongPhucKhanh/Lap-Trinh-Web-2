package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity ánh xạ bảng 'user' - tài khoản người dùng hệ thống.
 * Trường 'roles' lưu chuỗi phân cách bằng dấu phẩy, ví dụ: "ROLE_USER,ROLE_ADMIN".
 */
@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "orders")
@EqualsAndHashCode(exclude = "orders")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    /** Username dùng để đăng nhập, phải duy nhất */
    @Column(nullable = false, unique = true, length = 100)
    private String username;

    /** Password đã được mã hóa BCrypt */
    @Column(nullable = false, length = 255)
    private String password;

    /** Giới tính: "male", "female", "other" */
    @Column(length = 10)
    private String gender;

    @Column(length = 20)
    private String phone;

    @Column(unique = true, length = 200)
    private String email;

    /**
     * Danh sách role lưu dưới dạng chuỗi phân cách bởi dấu phẩy.
     * Ví dụ: "ROLE_USER" hoặc "ROLE_USER,ROLE_ADMIN"
     */
    @Column(length = 255)
    private String roles;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** 1 = active, 0 = banned/inactive */
    @Column(columnDefinition = "TINYINT DEFAULT 1")
    private Integer status;

    /** Một User có thể có nhiều Order */
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Order> orders;

    /** Một User có thể gửi nhiều Contact */
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Contact> contacts;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = 1;
        if (this.roles == null || this.roles.isBlank()) this.roles = "ROLE_USER";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}