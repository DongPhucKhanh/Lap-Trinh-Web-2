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

    private final String OLLAMA_URL = "http://localhost:11434/api/chat";
    private final String MODEL_NAME = "qwen2.5:1.5b";

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.dongphuckhanh.ltw2.repository.CategoryRepository categoryRepository;

    // Lưu lịch sử hội thoại theo session (in-memory).
    private final Map<String, List<Map<String, String>>> sessionHistory = new ConcurrentHashMap<>();

    // Số lượt hội thoại gần nhất được đưa vào prompt
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

        List<Map<String, String>> history = sessionHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());

        // Formatter cho giá tiền kiểu VN
        java.text.NumberFormat formatter = java.text.NumberFormat.getInstance(new Locale("vi", "VN"));

        List<com.dongphuckhanh.ltw2.entity.Category> allCategories = categoryRepository.findAll();
        Map<Long, String> categoryNames = allCategories.stream().collect(Collectors.toMap(com.dongphuckhanh.ltw2.entity.Category::getId, com.dongphuckhanh.ltw2.entity.Category::getName));

        List<Product> products = productRepository.findAll();
        long totalProducts = products.stream().filter(p -> p.getStatus() != null && p.getStatus() == 1).count();
        Map<String, List<Product>> groupedProducts = products.stream()
                .filter(p -> p.getStatus() != null && p.getStatus() == 1)
                .collect(Collectors.groupingBy(p -> {
                    if (p.getCategory() == null) return "Khác";
                    com.dongphuckhanh.ltw2.entity.Category cat = p.getCategory();
                    if (cat.getParentId() != null && cat.getParentId() > 0) {
                        String parentName = categoryNames.getOrDefault(cat.getParentId(), "");
                        if (!parentName.isEmpty()) {
                            return parentName + " / " + cat.getName();
                        }
                    }
                    return cat.getName();
                }));

        StringBuilder productContextBuilder = new StringBuilder();
        groupedProducts.forEach((category, list) -> {
            productContextBuilder.append("--- DANH MỤC: ").append(category.toUpperCase()).append(" ---\n");
            list.forEach(p -> productContextBuilder.append("- ")
                    .append(p.getName()).append(" (Giá: ")
                    .append(formatter.format(p.getPrice())).append(" ₫)\n"));
            productContextBuilder.append("\n");
        });
        String productContext = productContextBuilder.toString();

        // 2. TẠO LỜI NHẮC (SYSTEM PROMPT) NHẬP VAI CHO AI GIỐNG MẪU
        String systemPrompt = "Bạn là \"Trợ lý ảo Nova Store\", phục vụ khách hàng mua giày. Trả lời thân thiện bằng tiếng Việt.\n\n" +
                "LỆNH TỐI CAO:\n" +
                "1. Khi khách hàng chỉ gõ một từ khóa danh mục (ví dụ: 'giày nam', 'giày nữ', 'chạy bộ'), BẠN TUYỆT ĐỐI KHÔNG ĐƯỢC HỎI NGƯỢC LẠI (ví dụ: 'Bạn muốn tìm mẫu nào?').\n" +
                "2. Bạn PHẢI NGAY LẬP TỨC LIỆT KÊ TẤT CẢ TOÀN BỘ CÁC SẢN PHẨM có trong danh mục đó. ĐÓ LÀ BẮT BUỘC.\n" +
                "3. KHÔNG ĐƯỢC tóm tắt hay chỉ kể 1-2 mẫu đại diện! Phải copy đầy đủ tên tất cả sản phẩm của danh mục đó.\n\n" +
                "SỐ LIỆU VÀ DANH SÁCH SẢN PHẨM HIỆN CÓ:\n" +
                "- Tổng số sản phẩm: " + totalProducts + " sản phẩm.\n" +
                "- Tình trạng: Tất cả đều CÒN HÀNG. Size: 22.5cm=36, 23.5cm=37.5.\n\n" +
                productContext;

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // Nạp lịch sử
        int fromIndex = Math.max(0, history.size() - MAX_HISTORY_TURNS * 2);
        messages.addAll(history.subList(fromIndex, history.size()));

        // Nạp câu hỏi mới
        messages.add(Map.of("role", "user", "content", userMessage));

        // 3. GỌI XUỐNG MÁY CHỦ OLLAMA
        Map<String, Object> ollamaRequest = new HashMap<>();
        ollamaRequest.put("model", MODEL_NAME);
        ollamaRequest.put("messages", messages);
        ollamaRequest.put("stream", false);
        ollamaRequest.put("options", Map.of("temperature", 0.3));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(ollamaRequest, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(OLLAMA_URL, requestEntity, Map.class);
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to get response from AI"));
            }

            Map<String, Object> messageObj = (Map<String, Object>) response.getBody().get("message");
            String aiResponse = (String) messageObj.get("content");

            // GẮN PRODUCT CARD
            aiResponse = appendProductCards(aiResponse, products);

            // Cập nhật lịch sử
            history.add(Map.of("role", "user", "content", userMessage));
            history.add(Map.of("role", "assistant", "content", aiResponse));

            return ResponseEntity.ok(Map.of("response", aiResponse));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi kết nối với Trợ lý AI Offline. Hãy kiểm tra xem màn hình đen Ollama còn chạy không nhé!"));
        }
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