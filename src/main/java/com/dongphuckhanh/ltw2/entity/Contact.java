package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng 'contact' - tin nhắn / yêu cầu liên hệ từ khách hàng.
 * Hỗ trợ cơ chế phản hồi thông qua trường replyId.
 */
@Entity
@Table(name = "contact")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
@EqualsAndHashCode(exclude = "user")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Người dùng đã đăng nhập gửi liên hệ (null nếu khách vãng lai) */
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * ID của contact mà đây là phản hồi cho.
     * Null nếu đây là liên hệ gốc (không phải reply).
     */
    @Column(name = "reply_id")
    private Long replyId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Trạng thái: 0 = chưa đọc, 1 = đã đọc, 2 = đã trả lời
     */
    @Column(columnDefinition = "TINYINT DEFAULT 0")
    private Integer status;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
