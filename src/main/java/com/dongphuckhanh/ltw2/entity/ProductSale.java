package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng 'product_sale' - thông tin khuyến mãi / giảm giá của sản phẩm.
 * Quan hệ OneToOne với Product.
 */
@Entity
@Table(name = "product_sale")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "product")
@EqualsAndHashCode(exclude = "product")
public class ProductSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Quan hệ 1-1 với Product */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    /** Giá khuyến mãi */
    @Column(name = "pricesale", precision = 15, scale = 2)
    private BigDecimal pricesale;

    /** Ngày bắt đầu khuyến mãi */
    @Column(name = "date_begin")
    private LocalDate dateBegin;

    /** Ngày kết thúc khuyến mãi */
    @Column(name = "date_end")
    private LocalDate dateEnd;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Kiểm tra khuyến mãi có đang hiệu lực không.
     */
    @Transient
    public boolean isActive() {
        LocalDate today = LocalDate.now();
        return pricesale != null
                && dateBegin != null && !today.isBefore(dateBegin)
                && dateEnd != null && !today.isAfter(dateEnd);
    }
}