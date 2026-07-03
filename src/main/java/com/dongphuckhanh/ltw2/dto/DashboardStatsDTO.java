package com.dongphuckhanh.ltw2.dto;

import com.dongphuckhanh.ltw2.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalProducts;
    private Long totalUsers;
    private List<Order> recentOrders;
}
