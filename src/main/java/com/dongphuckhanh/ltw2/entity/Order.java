package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity ánh xạ bảng 'order' - đơn hàng của khách.
 * Quan hệ ManyToOne với User và OneToMany với OrderDetail.
 */
@Entity
@Table(name = "`order`")  // Dùng backtick vì "order" là từ khóa SQL
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "orderDetails"})
@EqualsAndHashCode(exclude = {"user", "orderDetails"})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Người đặt hàng (có thể null nếu guest checkout) */
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    /** Tên người nhận hàng */
    @Column(name = "delivery_name", nullable = false, length = 200)
    private String deliveryName;

    /** Số điện thoại người nhận */
    @Column(name = "delivery_phone", nullable = false, length = 20)
    private String deliveryPhone;

    /** Email người nhận */
    @Column(name = "delivery_email", length = 200)
    private String deliveryEmail;

    /** Địa chỉ giao hàng */
    @Column(name = "delivery_address", nullable = false, columnDefinition = "TEXT")
    private String deliveryAddress;

    /** Ghi chú của khách hàng */
    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Trạng thái đơn hàng:
     * 0 = Chờ xác nhận
     * 1 = Đã xác nhận
     * 2 = Đang chuẩn bị
     * 3 = Đang giao
     * 4 = Đã giao
     * 5 = Hoàn thành
     * 6 = Đã hủy
     * 7 = Hoàn tiền
     */
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer status;

    /** Lý do hủy hoặc hoàn tiền (nếu có) */
    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "payment_method")
    private String paymentMethod;

    /** Mã giảm giá (nếu có) */
    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    /** Số tiền được giảm (nếu có) */
    @Column(name = "discount_amount")
    private Double discountAmount;

    /** Danh sách chi tiết sản phẩm trong đơn hàng */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderDetail> orderDetails;

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