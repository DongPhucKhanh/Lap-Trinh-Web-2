package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository cho Order entity.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Lấy tất cả đơn hàng của một user, mới nhất trước */
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Lấy đơn hàng theo trạng thái */
    Page<Order> findByStatusOrderByCreatedAtDesc(Integer status, Pageable pageable);

    /** Lấy đơn hàng của user theo trạng thái */
    List<Order> findByUserIdAndStatus(Long userId, Integer status);

    /** Đếm đơn hàng của user */
    Long countByUserId(Long userId);

    /** Đếm đơn hàng theo trạng thái */
    Long countByStatus(Integer status);

    /**
     * Tính tổng doanh thu trong khoảng thời gian (chỉ tính đơn đã giao thành công - status = 3).
     */
    @Query("""
            SELECT COALESCE(SUM(od.amount), 0)
            FROM OrderDetail od
            WHERE od.order.status = 3
              AND od.order.createdAt BETWEEN :startDate AND :endDate
            """)
    BigDecimal calculateRevenue(@Param("startDate") LocalDateTime startDate,
                                @Param("endDate") LocalDateTime endDate);

    /**
     * Tìm đơn hàng theo số điện thoại giao hàng (khách tra cứu đơn).
     */
    List<Order> findByDeliveryPhoneOrderByCreatedAtDesc(String deliveryPhone);

    /**
     * Lấy đơn hàng gần đây nhất để hiển thị trên dashboard admin.
     */
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(Pageable pageable);
}
