package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho OrderDetail entity.
 */
@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    /** Lấy tất cả chi tiết của một đơn hàng */
    List<OrderDetail> findByOrderId(Long orderId);

    /** Xóa tất cả chi tiết đơn hàng khi hủy đơn */
    void deleteByOrderId(Long orderId);

    /**
     * Thống kê top N sản phẩm bán chạy nhất.
     * Trả về mảng [productId, productName, totalQty].
     */
    @Query("""
            SELECT od.product.id, od.product.name, SUM(od.qty) as totalQty
            FROM OrderDetail od
            WHERE od.order.status = 3
            GROUP BY od.product.id, od.product.name
            ORDER BY totalQty DESC
            """)
    List<Object[]> findTopSellingProducts(org.springframework.data.domain.Pageable pageable);

    /**
     * Tính tổng tiền của một đơn hàng.
     */
    @Query("SELECT COALESCE(SUM(od.amount), 0) FROM OrderDetail od WHERE od.order.id = :orderId")
    java.math.BigDecimal calculateOrderTotal(@Param("orderId") Long orderId);
}
