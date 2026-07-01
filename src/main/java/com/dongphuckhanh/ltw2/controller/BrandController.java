package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Brand;
import com.dongphuckhanh.ltw2.repository.BrandRepository;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    // 1. Lấy tất cả thương hiệu
    @GetMapping
    public ResponseEntity<?> getAllBrands() {
        try {
            List<Brand> list = brandRepository.findAll();
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            String json = mapper.writeValueAsString(list);
            return ResponseEntity.ok().header("Content-Type", "application/json").body(json);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            return ResponseEntity.status(500).body("Error occurred: " + e.getMessage() + "\n\nStack Trace:\n" + sw.toString());
        }
    }

    // 2. Lấy thương hiệu theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        return brandRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Thêm mới thương hiệu
    @PostMapping
    public ResponseEntity<?> createBrand(@RequestBody Brand brand) {
        try {
            Brand saved = brandRepository.save(brand);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            return ResponseEntity.status(500).body("Error occurred: " + e.getMessage() + "\n\nStack Trace:\n" + sw.toString());
        }
    }

    // 4. Cập nhật thương hiệu theo ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(@PathVariable Long id, @RequestBody Brand brandDetails) {
        return brandRepository.findById(id)
                .map(brand -> {
                    brand.setName(brandDetails.getName());
                    brand.setSlug(brandDetails.getSlug());
                    brand.setSortOrder(brandDetails.getSortOrder());
                    brand.setImage(brandDetails.getImage());
                    brand.setDescription(brandDetails.getDescription());
                    brand.setStatus(brandDetails.getStatus());
                    brand.setUpdatedBy(brandDetails.getUpdatedBy());
                    Brand updated = brandRepository.save(brand);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. Xóa thương hiệu theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
        if (!brandRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Kiểm tra xem thương hiệu có đang được sử dụng bởi sản phẩm nào không
        List<com.dongphuckhanh.ltw2.entity.Product> products = productRepository.findByBrandId(id);
        if (products != null && !products.isEmpty()) {
            return ResponseEntity.badRequest().body("Không thể xóa thương hiệu này vì đang có " + products.size() + " sản phẩm thuộc thương hiệu này.");
        }
        
        brandRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa thương hiệu thành công!");
    }
}
