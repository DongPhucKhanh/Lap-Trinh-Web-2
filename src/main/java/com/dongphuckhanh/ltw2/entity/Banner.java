package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng 'banner' - banner quảng cáo hiển thị trên website.
 */
@Entity
@Table(name = "banner")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String name;

    /** Đường dẫn hình ảnh banner */
    @Column(nullable = false, length = 500)
    private String image;

    /** URL khi click vào banner */
    @Column(length = 500)
    private String link;

    /**
     * Vị trí hiển thị:
     * Ví dụ: "home-top", "home-middle", "sidebar", "home-bottom"
     */
    @Column(length = 100)
    private String position;

    @Column(columnDefinition = "TEXT")
    private String description;

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

    /** 1 = active, 0 = inactive */
    @Column(columnDefinition = "TINYINT DEFAULT 1")
    private Integer status;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = 1;
        if (this.sortOrder == null) this.sortOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
