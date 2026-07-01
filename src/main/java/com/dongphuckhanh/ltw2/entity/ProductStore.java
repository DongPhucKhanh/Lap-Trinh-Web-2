package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng 'product_store' - thông tin tồn kho của sản phẩm.
 * Quan hệ OneToOne với Product.
 */
@Entity
@Table(name = "product_store")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "product")
@EqualsAndHashCode(exclude = "product")
public class ProductStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Quan hệ 1-1 với Product, cột khóa ngoại là 'product_id' */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Product product;

    /** Giá gốc (giá nhập kho) */
    @Column(name = "priceroot", precision = 15, scale = 2)
    private BigDecimal priceroot;

    /** Số lượng tồn kho */
    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer qty;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.qty == null) this.qty = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}