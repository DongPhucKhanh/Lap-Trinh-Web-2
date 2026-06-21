package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng 'category' trong database.
 * Hỗ trợ cấu trúc phân cấp (parent - children) thông qua self-referencing.
 */
@Entity
@Table(name = "category")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String image;

    /** ID của danh mục cha (null nếu là danh mục gốc) */
    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "sort_order", columnDefinition = "INT DEFAULT 0")
    private Integer sortOrder;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    /**
     * Trạng thái: 1 = active, 0 = inactive
     */
    @Column(columnDefinition = "TINYINT DEFAULT 1")
    private Integer status;

    /** Tự động gán thời gian tạo trước khi lưu lần đầu */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = 1;
        if (this.sortOrder == null) this.sortOrder = 0;
    }

    /** Tự động cập nhật thời gian sửa đổi */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}