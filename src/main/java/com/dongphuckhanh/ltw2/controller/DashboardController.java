package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.dto.DashboardStatsDTO;
import com.dongphuckhanh.ltw2.repository.OrderRepository;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        // Lấy tổng doanh thu (giả sử tính từ năm 2000 đến nay)
        LocalDateTime startDate = LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.now();
        BigDecimal totalRevenue = orderRepository.calculateRevenue(startDate, endDate);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        Long totalOrders = orderRepository.count();
        Long totalProducts = productRepository.count();
        Long totalUsers = userRepository.count();

        // Lấy 5 đơn hàng mới nhất
        var recentOrders = orderRepository.findRecentOrders(PageRequest.of(0, 5));

        DashboardStatsDTO stats = DashboardStatsDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalUsers(totalUsers)
                .recentOrders(recentOrders)
                .build();

        return ResponseEntity.ok(stats);
    }
}
