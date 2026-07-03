package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.dto.ReviewRequest;
import com.dongphuckhanh.ltw2.entity.Order;
import com.dongphuckhanh.ltw2.entity.OrderDetail;
import com.dongphuckhanh.ltw2.entity.Product;
import com.dongphuckhanh.ltw2.entity.Review;
import com.dongphuckhanh.ltw2.entity.User;
import com.dongphuckhanh.ltw2.repository.OrderDetailRepository;
import com.dongphuckhanh.ltw2.repository.OrderRepository;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import com.dongphuckhanh.ltw2.repository.ReviewRepository;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    // 1. Get reviews for a product
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsByProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        
        // Convert to DTO/Map to avoid exposing full User object (password, etc)
        List<Map<String, Object>> response = reviews.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("createdAt", r.getCreatedAt());
            map.put("userName", r.getUser().getName());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 2. Add a review
    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody ReviewRequest req) {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("Vui lòng đăng nhập để đánh giá");
        }

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Không tìm thấy thông tin người dùng");
        }
        User user = userOpt.get();

        // 1. Check if order exists and belongs to user
        Optional<Order> orderOpt = orderRepository.findById(req.getOrderId());
        if (orderOpt.isEmpty() || orderOpt.get().getUser() == null || !orderOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body("Order not found or does not belong to you");
        }
        
        Order order = orderOpt.get();
        // Optional: Ensure order is completed (e.g., status == 4)
        if (order.getStatus() != 4 && order.getStatus() != 5) {
            return ResponseEntity.badRequest().body("Chỉ có thể đánh giá đơn hàng đã giao thành công");
        }

        // 2. Check if product exists in this order
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());
        boolean hasProduct = details.stream().anyMatch(d -> d.getProduct().getId().equals(req.getProductId()));
        if (!hasProduct) {
            return ResponseEntity.badRequest().body("Sản phẩm không có trong đơn hàng này");
        }

        // 3. Check if already reviewed
        if (reviewRepository.existsByUserIdAndProductIdAndOrderId(user.getId(), req.getProductId(), order.getId())) {
            return ResponseEntity.badRequest().body("Bạn đã đánh giá sản phẩm này trong đơn hàng rồi");
        }

        // 4. Create review
        Product product = productRepository.findById(req.getProductId()).get();
        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setOrderId(order.getId());
        review.setRating(req.getRating());
        review.setComment(req.getComment());
        reviewRepository.save(review);

        return ResponseEntity.ok(Map.of("success", true, "message", "Đánh giá thành công"));
    }

    // 3. Get latest reviews for homepage
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestReviews() {
        List<Review> reviews = reviewRepository.findTop10ByOrderByCreatedAtDesc();
        List<Map<String, Object>> response = reviews.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("createdAt", r.getCreatedAt());
            map.put("userName", r.getUser().getName());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
