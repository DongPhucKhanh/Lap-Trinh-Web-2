package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Order;
import com.dongphuckhanh.ltw2.entity.OrderDetail;
import com.dongphuckhanh.ltw2.entity.Product;
import com.dongphuckhanh.ltw2.repository.OrderDetailRepository;
import com.dongphuckhanh.ltw2.repository.OrderRepository;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import com.dongphuckhanh.ltw2.repository.VoucherRepository;
import com.dongphuckhanh.ltw2.entity.Voucher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dongphuckhanh.ltw2.service.EmailService;

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

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.dongphuckhanh.ltw2.repository.ProductVariantRepository productVariantRepository;

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

        // Lưu phương thức thanh toán (cod hoặc transfer)
        String paymentMethod = (String) payload.get("paymentMethod");
        order.setPaymentMethod(paymentMethod);

        // --- Voucher info (để lưu sau khi tính tổng tiền) ---
        String voucherCode = (String) payload.get("voucherCode");
        Voucher appliedVoucher = null;
        if (voucherCode != null && !voucherCode.trim().isEmpty()) {
            Optional<Voucher> optVoucher = voucherRepository.findByCode(voucherCode);
            if (optVoucher.isPresent()) {
                appliedVoucher = optVoucher.get();
                order.setVoucherCode(voucherCode);
            }
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
        BigDecimal totalOrderAmount = BigDecimal.ZERO;

        for (Object rawItem : rawItems) {
            Map<?, ?> item = (Map<?, ?>) rawItem;

            Long productId = Long.valueOf(item.get("productId").toString());
            Integer qty    = Integer.valueOf(item.get("qty").toString());
            BigDecimal discount = item.get("discount") != null
                    ? new BigDecimal(item.get("discount").toString())
                    : BigDecimal.ZERO;
            
            String variantColor = item.get("variantColor") != null ? item.get("variantColor").toString() : null;
            String variantSize = item.get("variantSize") != null ? item.get("variantSize").toString() : null;

            Optional<Product> productOpt = productRepository.findById(productId);
            if (productOpt.isEmpty()) {
                orderRepository.delete(savedOrder);
                return ResponseEntity.badRequest()
                        .body("Sản phẩm với ID=" + productId + " không tồn tại!");
            }

            Product product = productOpt.get();
            BigDecimal price = product.getPrice();
            if (product.getProductSale() != null && product.getProductSale().getPricesale() != null) {
                price = product.getProductSale().getPricesale();
            }

            // Kiểm tra và trừ số lượng Biến thể (nếu có chọn màu/size)
            if (variantColor != null && variantSize != null && !variantColor.trim().isEmpty() && !variantSize.trim().isEmpty()) {
                Optional<com.dongphuckhanh.ltw2.entity.ProductVariant> variantOpt = productVariantRepository.findByProductIdAndColorAndSize(productId, variantColor, variantSize);
                
                if (variantOpt.isPresent()) {
                    com.dongphuckhanh.ltw2.entity.ProductVariant variant = variantOpt.get();
                    if (variant.getQty() < qty) {
                        orderRepository.delete(savedOrder);
                        return ResponseEntity.badRequest()
                                .body("Sản phẩm " + product.getName() + " (Màu: " + variantColor + " - Size: " + variantSize + ") không đủ số lượng!");
                    }
                    variant.setQty(variant.getQty() - qty);
                    productVariantRepository.save(variant);
                }
            }

            // Trừ số lượng Tổng kho
            if (product.getProductStore() != null) {
                int currentQty = product.getProductStore().getQty();
                if (currentQty < qty) {
                    orderRepository.delete(savedOrder);
                    return ResponseEntity.badRequest()
                            .body("Sản phẩm " + product.getName() + " không đủ số lượng tổng!");
                }
                product.getProductStore().setQty(currentQty - qty);
                productRepository.save(product);
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(savedOrder);
            detail.setProduct(product);
            detail.setVariantColor(variantColor);
            detail.setVariantSize(variantSize);
            detail.setPrice(price);
            detail.setQty(qty);
            detail.setDiscount(discount);
            // amount sẽ được tính tự động bởi @PrePersist trong OrderDetail
            detailList.add(detail);

            totalOrderAmount = totalOrderAmount.add(price.multiply(new BigDecimal(qty)));
        }

        orderDetailRepository.saveAll(detailList);

        // --- Áp dụng Mã khuyến mãi và cập nhật DB ---
        if (appliedVoucher != null && appliedVoucher.getStatus() == 1) {
            double total = totalOrderAmount.doubleValue();
            if (appliedVoucher.getMinOrderValue() == null || total >= appliedVoucher.getMinOrderValue()) {
                double discountAmount = total * (appliedVoucher.getDiscountPercent() / 100.0);
                if (appliedVoucher.getMaxDiscountAmount() != null && discountAmount > appliedVoucher.getMaxDiscountAmount()) {
                    discountAmount = appliedVoucher.getMaxDiscountAmount();
                }
                
                savedOrder.setDiscountAmount(discountAmount);
                orderRepository.save(savedOrder);
                
                // Tăng số lượt sử dụng
                appliedVoucher.setUsedCount((appliedVoucher.getUsedCount() == null ? 0 : appliedVoucher.getUsedCount()) + 1);
                voucherRepository.save(appliedVoucher);
            }
        }

        // Gửi email xác nhận đơn hàng
        if (savedOrder.getDeliveryEmail() != null && !savedOrder.getDeliveryEmail().isBlank()) {
            if (!"transfer".equals(savedOrder.getPaymentMethod())) {
                emailService.sendOrderConfirmation(savedOrder.getDeliveryEmail(), savedOrder, detailList);
            }
        }

        return ResponseEntity.ok(savedOrder);
    }

    // ============================================================
    // 5. Cập nhật trạng thái đơn hàng
    //    Body JSON: { "status": 1 }
    // ============================================================
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id,
                                                @RequestBody Map<String, Object> body) {
        Object statusObj = body.get("status");
        if (statusObj == null) {
            return ResponseEntity.badRequest().body("Vui lòng truyền trường 'status'");
        }
        Integer newStatus = Integer.valueOf(statusObj.toString());
        String cancelReason = body.get("cancelReason") != null ? body.get("cancelReason").toString() : null;

        return orderRepository.findById(id)
                .map(order -> {
                    if (newStatus == 6 || newStatus == 7) {
                        order.setCancelReason(cancelReason);
                        
                        // Hoàn trả lại số lượng kho
                        if (order.getStatus() != 6 && order.getStatus() != 7) {
                            List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());
                            for (OrderDetail detail : details) {
                                // 1. Hoàn trả cho Variant (nếu có)
                                if (detail.getVariantColor() != null && detail.getVariantSize() != null) {
                                    productVariantRepository.findByProductIdAndColorAndSize(
                                            detail.getProduct().getId(), 
                                            detail.getVariantColor(), 
                                            detail.getVariantSize()
                                    ).ifPresent(variant -> {
                                        variant.setQty(variant.getQty() + detail.getQty());
                                        productVariantRepository.save(variant);
                                    });
                                }
                                
                                // 2. Hoàn trả cho ProductStore (tổng)
                                Product p = detail.getProduct();
                                if (p.getProductStore() != null) {
                                    p.getProductStore().setQty(p.getProductStore().getQty() + detail.getQty());
                                    productRepository.save(p);
                                }
                            }
                        }
                    }
                    order.setStatus(newStatus);
                    Order updatedOrder = orderRepository.save(order);
                    
                    // Gửi email thông báo thay đổi trạng thái
                    if (updatedOrder.getDeliveryEmail() != null && !updatedOrder.getDeliveryEmail().isBlank()) {
                        // Nếu là thanh toán chuyển khoản và admin vừa xác nhận đơn (status 1) -> Gửi mail Đặt hàng thành công
                        if (newStatus == 1 && "transfer".equals(updatedOrder.getPaymentMethod())) {
                            List<OrderDetail> detailList = orderDetailRepository.findByOrderId(updatedOrder.getId());
                            emailService.sendOrderConfirmation(updatedOrder.getDeliveryEmail(), updatedOrder, detailList);
                        } else {
                            emailService.sendOrderStatusChange(updatedOrder.getDeliveryEmail(), updatedOrder, newStatus);
                        }
                    }
                    
                    return ResponseEntity.ok(updatedOrder);
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

    // ============================================================
    // 7. Xóa 1 sản phẩm trong đơn hàng (khi hàng lỗi/hết hàng)
    //    Body JSON: { "reason": "Lý do xóa..." }
    // ============================================================
    @DeleteMapping("/{orderId}/items/{itemId}")
    public ResponseEntity<?> deleteOrderItem(@PathVariable Long orderId, 
                                             @PathVariable Long itemId,
                                             @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng cung cấp lý do xóa sản phẩm.");
        }
        
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Order order = orderOpt.get();
        
        Optional<OrderDetail> itemOpt = orderDetailRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        OrderDetail item = itemOpt.get();
        
        // Ensure the item belongs to the order
        if (!item.getOrder().getId().equals(orderId)) {
            return ResponseEntity.badRequest().body("Sản phẩm không thuộc đơn hàng này.");
        }
        
        // Gửi email thông báo cho khách hàng
        if (order.getDeliveryEmail() != null && !order.getDeliveryEmail().isBlank()) {
            emailService.sendItemCancellationNotice(order.getDeliveryEmail(), order, item, reason);
        }
        
        // Xóa sản phẩm khỏi DB và khỏi danh sách của order
        order.getOrderDetails().remove(item);
        orderDetailRepository.delete(item);
        
        return ResponseEntity.ok(order);
    }
}
