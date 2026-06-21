package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Product;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import com.dongphuckhanh.ltw2.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // 1. Lấy tất cả món ăn
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    // 2. Lấy món ăn theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Lấy danh sách món ăn theo Category ID
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productRepository.findByCategoryId(categoryId));
    }

    // 4. Thêm món ăn mới (Cần truyền category_id vào JSON)
  // 4. Thêm món ăn mới (Cần truyền category_id vào JSON)
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        if (product.getCategory() == null || product.getCategory().getId() == null) {
            return ResponseEntity.badRequest().body("Vui lòng cung cấp ID của danh mục (category.id)");
        }
        
        // Dùng if-else để xử lý thay vì map().orElse() để tránh xung đột kiểu dữ liệu
        java.util.Optional<com.dongphuckhanh.ltw2.entity.Category> categoryOptional = categoryRepository.findById(product.getCategory().getId());
        
        if (categoryOptional.isPresent()) {
            product.setCategory(categoryOptional.get());
            return ResponseEntity.ok(productRepository.save(product));
        } else {
            return ResponseEntity.badRequest().body("Danh mục không tồn tại!");
        }
    }

    // 5. Xóa món ăn
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa sản phẩm thành công!");
    }
}