package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity ánh xạ bảng 'product'.
 * Quan hệ ManyToOne với Category và Brand.
 * Quan hệ OneToOne với ProductStore và ProductSale.
 */
@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"category", "brand", "productStore", "productSale", "orderDetails"})
@EqualsAndHashCode(exclude = {"category", "brand", "productStore", "productSale", "orderDetails"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Quan hệ nhiều Product thuộc một Category */
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /** Quan hệ nhiều Product thuộc một Brand */
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(nullable = false, unique = true, length = 300)
    private String slug;

    /** Nội dung chi tiết dạng HTML */
    @Column(columnDefinition = "LONGTEXT")
    private String detail;

    /** Mô tả ngắn */
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String image;

    /** Danh sách ảnh phụ, lưu chuỗi JSON hoặc cách nhau bằng dấu phẩy */
    @Column(columnDefinition = "TEXT")
    private String gallery;

    /** Sản phẩm nổi bật (1 = nổi bật, 0 = bình thường) */
    @Column(name = "is_featured", columnDefinition = "TINYINT DEFAULT 0")
    private Boolean isFeatured;

    /** Giá bán niêm yết */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

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

    /** Thông tin tồn kho (quan hệ 1-1) */
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private ProductStore productStore;

    /** Thông tin khuyến mãi (quan hệ 1-1) */
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private ProductSale productSale;

    /** Danh sách chi tiết đơn hàng chứa sản phẩm này */
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<OrderDetail> orderDetails;

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