package com.dongphuckhanh.ltw2.controller.api;

import com.dongphuckhanh.ltw2.entity.Product;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    // Cấu hình timeout để tránh request bị treo khi Ollama xử lý chậm
    private final RestTemplate restTemplate;

    public ChatController() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 giây
        factory.setReadTimeout(60000);   // 60 giây
        this.restTemplate = new RestTemplate(factory);
    }

    private final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private final String MODEL_NAME = "qwen2.5:1.5b";

    @Autowired
    private ProductRepository productRepository;

    // Lưu lịch sử hội thoại theo session (in-memory).
    // LƯU Ý: chỉ phù hợp demo/dev. Lên production nên chuyển sang Redis hoặc bảng DB,
    // vì Map này sẽ mất dữ liệu khi restart server và không scale khi chạy nhiều instance.
    private final Map<String, List<String>> sessionHistory = new ConcurrentHashMap<>();

    // Số lượt hội thoại gần nhất được đưa vào prompt (1 lượt = 1 câu khách + 1 câu bot)
    private static final int MAX_HISTORY_TURNS = 6;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        String sessionId = payload.get("sessionId");

        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "sessionId is required"));
        }

        List<String> history = sessionHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());

        // Chỉ lấy N dòng gần nhất để tránh prompt quá dài (model nhỏ context hạn chế)
        int fromIndex = Math.max(0, history.size() - MAX_HISTORY_TURNS * 2);
        String historyContext = history.subList(fromIndex, history.size()).isEmpty()
                ? "(chưa có)"
                : String.join("\n", history.subList(fromIndex, history.size()));

        // Formatter cho giá tiền kiểu VN (VD: 3.829.000 ₫)
        java.text.NumberFormat formatter = java.text.NumberFormat.getInstance(new Locale("vi", "VN"));

        List<Product> products = productRepository.findAll();
        String productContext = products.stream()
                .filter(p -> p.getStatus() != null && p.getStatus() == 1)
                .map(p -> "- " + p.getName() + " (Thương hiệu: " + (p.getBrand() != null ? p.getBrand().getName() : "Khác") + ", Giá: " + formatter.format(p.getPrice()) + " ₫, Danh mục: "
                        + (p.getCategory() != null ? p.getCategory().getName() : "Khác") + ")")
                .collect(Collectors.joining("\n"));

        String prompt = buildPrompt(productContext, historyContext, userMessage);

        Map<String, Object> ollamaRequest = new HashMap<>();
        ollamaRequest.put("model", MODEL_NAME);
        ollamaRequest.put("prompt", prompt);
        ollamaRequest.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(ollamaRequest, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(OLLAMA_URL, requestEntity, Map.class);
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to get response from AI"));
            }

            String aiResponse = (String) response.getBody().get("response");

            // GẮN PRODUCT CARD cho các sản phẩm được nhắc tới trong câu trả lời
            aiResponse = appendProductCards(aiResponse, products);

            // Lưu lịch sử hội thoại
            history.add("Khách: " + userMessage);
            history.add("Bạn: " + aiResponse);

            return ResponseEntity.ok(Map.of("response", aiResponse));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Ollama is not running or unreachable on port 11434"));
        }
    }

    private String buildPrompt(String productContext, String historyContext, String userMessage) {
        return "Bạn là nhân viên bán hàng của SneakerHub. Xưng hô là 'em' và 'anh/chị'. Trả lời NGẮN GỌN, THÂN THIỆN BẰNG TIẾNG VIỆT.\n\n"
                + "DANH SÁCH SẢN PHẨM HIỆN CÓ CỦA SHOP:\n" + productContext + "\n\n"
                + "QUY TẮC TƯ VẤN:\n"
                + "- Size giày: 22.5cm=36, 23.5cm=37.5, 25cm=40, 26cm=41, 27cm=42.5. Nike khuyên tăng 1 size.\n"
                + "- Tồn kho: Tất cả đều CÒN HÀNG.\n"
                + "- Đổi trả & Giao hàng: Đổi miễn phí 7 ngày. Freeship đơn > 2 triệu.\n\n"
                + "--- VÍ DỤ CÁCH TRẢ LỜI MẪU ---\n"
                + "Khách: Cho tôi xem giày chạy bộ nam\n"
                + "Nhân viên: Dạ, bên em có các mẫu giày chạy bộ nam là Nike Pegasus 42 và Nike Air Zoom. Anh/chị ưng ý mẫu nào ạ?\n\n"
                + "Khách: Có giày bóng rổ không\n"
                + "Nhân viên: Dạ, shop em có các mẫu giày bóng rổ Nike LeBron 20, Adidas Harden Vol 7 và Puma MB.02 ạ. Anh/chị thích mẫu nào?\n"
                + "--------------------------------\n\n"
                + "LỊCH SỬ HỘI THOẠI:\n" + historyContext + "\n\n"
                + "Lệnh: Dựa vào Danh sách sản phẩm trên, hãy CHỌN LỌC những sản phẩm đúng Danh mục để giới thiệu cho khách bằng văn xuôi. TUYỆT ĐỐI không copy nguyên xi định dạng danh sách. TUYỆT ĐỐI không giới thiệu sai danh mục (VD: Khách tìm giày đá bóng thì không giới thiệu giày bóng rổ). LUÔN VIẾT TÊN SẢN PHẨM ĐẦY ĐỦ để hệ thống hiện ảnh.\n"
                + "Khách hàng nói: " + userMessage + "\n"
                + "Nhân viên:";
    }

    private String appendProductCards(String aiResponse, List<Product> products) {
        StringBuilder attachments = new StringBuilder();
        Set<Long> addedProductIds = new HashSet<>();

        for (Product p : products) {
            if (p.getStatus() != null && p.getStatus() == 1
                    && aiResponse.contains(p.getName())
                    && !addedProductIds.contains(p.getId())) {
                String productJson = String.format(
                        "{\"id\": %d, \"name\": \"%s\", \"price\": %s, \"image\": \"%s\"}",
                        p.getId(), p.getName(), p.getPrice().toString(), p.getImage());
                attachments.append("\n[PRODUCT_CARD: ").append(productJson).append("]\n");
                addedProductIds.add(p.getId());
            }
        }

        return aiResponse + attachments;
    }
}