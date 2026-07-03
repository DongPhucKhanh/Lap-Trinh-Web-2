package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.config.VNPayConfig;
import com.dongphuckhanh.ltw2.entity.Order;
import com.dongphuckhanh.ltw2.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/create_url")
    public ResponseEntity<?> createPayment(HttpServletRequest request,
                                           @RequestParam("amount") long amount,
                                           @RequestParam("orderId") String orderId) {
        String vnp_Version = vnPayConfig.vnp_Version;
        String vnp_Command = vnPayConfig.vnp_Command;
        String vnp_OrderInfo = "Thanh toan don hang " + orderId;
        String vnp_IpAddr = vnPayConfig.getIpAddress(request);
        String vnp_TmnCode = vnPayConfig.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        
        vnp_Params.put("vnp_TxnRef", orderId + "_" + vnPayConfig.getRandomNumber(4));
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.vnp_PayUrl + "?" + queryUrl;

        Map<String, String> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vnpay_return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> queryParams) {
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        queryParams.remove("vnp_SecureHash");
        queryParams.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(queryParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) queryParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String signValue = vnPayConfig.hmacSHA512(vnPayConfig.vnp_HashSecret, hashData.toString());
        Map<String, Object> result = new HashMap<>();
        
        if (signValue.equals(vnp_SecureHash)) {
            if ("00".equals(queryParams.get("vnp_ResponseCode"))) {
                // Thanh toán thành công
                // Trích xuất Order ID (do lúc nãy ta ghép orderId + "_" + random)
                String txnRef = queryParams.get("vnp_TxnRef");
                String[] parts = txnRef.split("_");
                if (parts.length > 0) {
                    try {
                        Long orderId = Long.parseLong(parts[0]);
                        Optional<Order> orderOpt = orderRepository.findById(orderId);
                        if (orderOpt.isPresent()) {
                            Order order = orderOpt.get();
                            // Cập nhật trạng thái thành Đã Thanh Toán (ví dụ 1 hoặc 2 tùy hệ thống)
                            // Trong hệ thống này: 0: Chờ xác nhận, 1: Xác nhận/chuẩn bị hàng, 2: Đã thanh toán, ...
                            order.setStatus(2); // Cứ cho 2 là đã thanh toán online thành công
                            orderRepository.save(order);
                            result.put("success", true);
                            result.put("message", "Thanh toán thành công");
                            result.put("orderId", orderId);
                            return ResponseEntity.ok(result);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            } else {
                result.put("success", false);
                result.put("message", "Giao dịch không thành công");
            }
        } else {
            result.put("success", false);
            result.put("message", "Chữ ký không hợp lệ");
        }
        return ResponseEntity.badRequest().body(result);
    }
}
