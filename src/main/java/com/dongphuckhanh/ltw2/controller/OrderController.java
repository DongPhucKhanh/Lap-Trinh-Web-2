package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Order;
import com.dongphuckhanh.ltw2.entity.OrderDetail;
import com.dongphuckhanh.ltw2.entity.Product;
import com.dongphuckhanh.ltw2.repository.OrderDetailRepository;
import com.dongphuckhanh.ltw2.repository.OrderRepository;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // ============================================================
    // 1. Lấy tất cả đơn hàng (dành cho Admin)
    // ============================================================
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    // ============================================================
    // 2. Lấy đơn hàng theo ID
    // ============================================================
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ============================================================
    // 3. Lấy tất cả đơn hàng của một User
    // ============================================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(orders);
    }

    // ============================================================
    // 4. Checkout - Tạo đơn hàng mới kèm danh sách sản phẩm
    //    Body JSON mẫu:
    //    {
    //      "deliveryName": "Nguyen Van A",
    //      "deliveryPhone": "0901234567",
    //      "deliveryEmail": "a@email.com",
    //      "deliveryAddress": "123 Đường ABC, TP.HCM",
    //      "note": "Giao giờ hành chính",
    //      "userId": 1,          (tùy chọn, null nếu guest)
    //      "items": [
    //        { "productId": 5, "qty": 2, "discount": 0 },
    //        { "productId": 8, "qty": 1, "discount": 5000 }
    //      ]
    //    }
    // ============================================================
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> payload) {
        // --- Lấy thông tin giao hàng từ payload ---
        String deliveryName    = (String) payload.get("deliveryName");
        String deliveryPhone   = (String) payload.get("deliveryPhone");
        String deliveryEmail   = (String) payload.get("deliveryEmail");
        String deliveryAddress = (String) payload.get("deliveryAddress");
        String note            = (String) payload.get("note");

        if (deliveryName == null || deliveryPhone == null || deliveryAddress == null) {
            return ResponseEntity.badRequest()
                    .body("Thiếu thông tin giao hàng bắt buộc: deliveryName, deliveryPhone, deliveryAddress");
        }

        // --- Tạo đối tượng Order ---
        Order order = new Order();
        order.setDeliveryName(deliveryName);
        order.setDeliveryPhone(deliveryPhone);
        order.setDeliveryEmail(deliveryEmail);
        order.setDeliveryAddress(deliveryAddress);
        order.setNote(note);
        order.setStatus(0); // Chờ xác nhận

        // Gán user nếu có userId
        if (payload.get("userId") != null) {
            Long userId = Long.valueOf(payload.get("userId").toString());
            userRepository.findById(userId).ifPresent(order::setUser);
        }

        // --- Lưu Order trước để có ID ---
        Order savedOrder = orderRepository.save(order);

        // --- Xử lý danh sách sản phẩm (items) ---
        List<?> rawItems = (List<?>) payload.get("items");
        if (rawItems == null || rawItems.isEmpty()) {
            orderRepository.delete(savedOrder);
            return ResponseEntity.badRequest().body("Đơn hàng phải có ít nhất 1 sản phẩm!");
        }

        List<OrderDetail> detailList = new ArrayList<>();
        for (Object rawItem : rawItems) {
            Map<?, ?> item = (Map<?, ?>) rawItem;

            Long productId = Long.valueOf(item.get("productId").toString());
            Integer qty    = Integer.valueOf(item.get("qty").toString());
            BigDecimal discount = item.get("discount") != null
                    ? new BigDecimal(item.get("discount").toString())
                    : BigDecimal.ZERO;

            Optional<Product> productOpt = productRepository.findById(productId);
            if (productOpt.isEmpty()) {
                orderRepository.delete(savedOrder);
                return ResponseEntity.badRequest()
                        .body("Sản phẩm với ID=" + productId + " không tồn tại!");
            }

            Product product = productOpt.get();
            BigDecimal price = product.getPrice();

            OrderDetail detail = new OrderDetail();
            detail.setOrder(savedOrder);
            detail.setProduct(product);
            detail.setPrice(price);
            detail.setQty(qty);
            detail.setDiscount(discount);
            // amount sẽ được tính tự động bởi @PrePersist trong OrderDetail
            detailList.add(detail);
        }

        orderDetailRepository.saveAll(detailList);

        return ResponseEntity.ok(savedOrder);
    }

    // ============================================================
    // 5. Cập nhật trạng thái đơn hàng
    //    Body JSON: { "status": 1 }
    // ============================================================
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id,
                                                @RequestBody Map<String, Integer> body) {
        Integer newStatus = body.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body("Vui lòng truyền trường 'status'");
        }

        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(newStatus);
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ============================================================
    // 6. Xóa đơn hàng theo ID
    // ============================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa đơn hàng thành công!");
    }
}
