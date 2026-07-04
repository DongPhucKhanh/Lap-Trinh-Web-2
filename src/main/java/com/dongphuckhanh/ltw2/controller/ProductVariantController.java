package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Product;
import com.dongphuckhanh.ltw2.entity.ProductVariant;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import com.dongphuckhanh.ltw2.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/product-variants")
@CrossOrigin(origins = "*")
public class ProductVariantController {

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private ProductRepository productRepository;

    // Lấy tất cả biến thể của 1 sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVariant>> getVariantsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(variantRepository.findByProductId(productId));
    }

    // Thêm mới biến thể
    @PostMapping("/product/{productId}")
    public ResponseEntity<?> addVariant(@PathVariable Long productId, @RequestBody ProductVariant variant) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (!productOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Sản phẩm không tồn tại");
        }
        variant.setProduct(productOpt.get());
        ProductVariant saved = variantRepository.save(variant);
        return ResponseEntity.ok(saved);
    }

    // Xóa biến thể
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVariant(@PathVariable Long id) {
        if (!variantRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Biến thể không tồn tại");
        }
        variantRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Xóa tất cả biến thể của sản phẩm
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<?> deleteVariantsByProduct(@PathVariable Long productId) {
        List<ProductVariant> list = variantRepository.findByProductId(productId);
        variantRepository.deleteAll(list);
        return ResponseEntity.ok().build();
    }
}
