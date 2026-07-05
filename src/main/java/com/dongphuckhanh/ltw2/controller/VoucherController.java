package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Voucher;
import com.dongphuckhanh.ltw2.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "*") // Allows calls from both admin and client React apps
public class VoucherController {

    @Autowired
    private VoucherRepository voucherRepository;

    @GetMapping
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    @GetMapping("/active")
    public List<Voucher> getActiveVouchers() {
        return voucherRepository.findActiveVouchers(new java.util.Date());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Voucher> getVoucherById(@PathVariable Long id) {
        Optional<Voucher> voucher = voucherRepository.findById(id);
        return voucher.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Voucher createVoucher(@RequestBody Voucher voucher) {
        // Initialize default used count if not provided
        if (voucher.getUsedCount() == null) {
            voucher.setUsedCount(0);
        }
        return voucherRepository.save(voucher);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Voucher> updateVoucher(@PathVariable Long id, @RequestBody Voucher voucherDetails) {
        Optional<Voucher> optionalVoucher = voucherRepository.findById(id);
        if (optionalVoucher.isPresent()) {
            Voucher existingVoucher = optionalVoucher.get();
            existingVoucher.setCode(voucherDetails.getCode());
            existingVoucher.setDiscountPercent(voucherDetails.getDiscountPercent());
            existingVoucher.setMaxDiscountAmount(voucherDetails.getMaxDiscountAmount());
            existingVoucher.setMinOrderValue(voucherDetails.getMinOrderValue());
            existingVoucher.setUsageLimit(voucherDetails.getUsageLimit());
            existingVoucher.setStartDate(voucherDetails.getStartDate());
            existingVoucher.setEndDate(voucherDetails.getEndDate());
            existingVoucher.setStatus(voucherDetails.getStatus());
            
            Voucher updatedVoucher = voucherRepository.save(existingVoucher);
            return ResponseEntity.ok(updatedVoucher);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        if (voucherRepository.existsById(id)) {
            voucherRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyVoucher(@RequestBody ApplyVoucherRequest request) {
        Optional<Voucher> optionalVoucher = voucherRepository.findByCode(request.getCode());
        if (optionalVoucher.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApplyVoucherResponse(false, 0.0, "Mã giảm giá không tồn tại!"));
        }

        Voucher voucher = optionalVoucher.get();

        if (voucher.getStatus() == 0) {
            return ResponseEntity.badRequest().body(new ApplyVoucherResponse(false, 0.0, "Mã giảm giá đã bị khóa!"));
        }

        java.util.Date now = new java.util.Date();
        if (voucher.getStartDate() != null && now.before(voucher.getStartDate())) {
            return ResponseEntity.badRequest().body(new ApplyVoucherResponse(false, 0.0, "Mã giảm giá chưa đến thời gian áp dụng!"));
        }
        if (voucher.getEndDate() != null && now.after(voucher.getEndDate())) {
            return ResponseEntity.badRequest().body(new ApplyVoucherResponse(false, 0.0, "Mã giảm giá đã hết hạn!"));
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            return ResponseEntity.badRequest().body(new ApplyVoucherResponse(false, 0.0, "Mã giảm giá đã hết lượt sử dụng!"));
        }

        if (voucher.getMinOrderValue() != null && request.getCartTotal() < voucher.getMinOrderValue()) {
            return ResponseEntity.badRequest().body(new ApplyVoucherResponse(false, 0.0, "Đơn hàng chưa đạt giá trị tối thiểu " + String.format("%.0f", voucher.getMinOrderValue()) + "đ!"));
        }

        // Calculate discount
        double discountAmount = request.getCartTotal() * (voucher.getDiscountPercent() / 100.0);
        
        if (voucher.getMaxDiscountAmount() != null && discountAmount > voucher.getMaxDiscountAmount()) {
            discountAmount = voucher.getMaxDiscountAmount();
        }

        return ResponseEntity.ok(new ApplyVoucherResponse(true, discountAmount, "Áp dụng mã thành công!"));
    }

    public static class ApplyVoucherRequest {
        private String code;
        private Double cartTotal;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public Double getCartTotal() { return cartTotal; }
        public void setCartTotal(Double cartTotal) { this.cartTotal = cartTotal; }
    }

    public static class ApplyVoucherResponse {
        private boolean valid;
        private Double discountAmount;
        private String message;

        public ApplyVoucherResponse(boolean valid, Double discountAmount, String message) {
            this.valid = valid;
            this.discountAmount = discountAmount;
            this.message = message;
        }

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public Double getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
