package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng 'post' - bài viết blog / tin tức.
 * Quan hệ ManyToOne với Topic.
 */
@Entity
@Table(name = "post")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "topic")
@EqualsAndHashCode(exclude = "topic")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Chủ đề / danh mục của bài viết */
    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false, unique = true, length = 300)
    private String slug;

    @Column(nullable = false, length = 500)
    private String title;

    /** Nội dung đầy đủ dạng HTML / Markdown */
    @Column(columnDefinition = "LONGTEXT")
    private String detail;

    /** Ảnh đại diện bài viết */
    @Column(length = 500)
    private String image;

    /**
     * Loại bài viết: "news" = tin tức, "blog" = blog, "review" = đánh giá sản phẩm
     */
    @Column(length = 50)
    private String type;

    /** Mô tả ngắn (dùng cho SEO meta description) */
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    /** 1 = published, 0 = draft */
    @Column(columnDefinition = "TINYINT DEFAULT 1")
    private Integer status;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = 1;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
