package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Entity ánh xạ bảng 'order_detail' - chi tiết từng dòng sản phẩm trong đơn hàng.
 * Quan hệ ManyToOne với Order và Product.
 */
@Entity
@Table(name = "order_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"order", "product"})
@EqualsAndHashCode(exclude = {"order", "product"})
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Đơn hàng mà dòng này thuộc về */
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order;

    /** Sản phẩm trong dòng đơn hàng này */
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Giá tại thời điểm đặt hàng (snapshot) */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    /** Số lượng mua */
    @Column(nullable = false)
    private Integer qty;

    /** Phần trăm hoặc số tiền giảm giá */
    @Column(precision = 15, scale = 2, columnDefinition = "DECIMAL(15,2) DEFAULT 0")
    private BigDecimal discount;

    /**
     * Thành tiền = price * qty - discount.
     * Được tính và lưu trữ trực tiếp để tiện truy vấn.
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    /**
     * Tính amount tự động trước khi persist / update.
     */
    @PrePersist
    @PreUpdate
    protected void calculateAmount() {
        if (this.price != null && this.qty != null) {
            BigDecimal baseAmount = this.price.multiply(BigDecimal.valueOf(this.qty));
            BigDecimal disc = this.discount != null ? this.discount : BigDecimal.ZERO;
            this.amount = baseAmount.subtract(disc);
        }
    }
}