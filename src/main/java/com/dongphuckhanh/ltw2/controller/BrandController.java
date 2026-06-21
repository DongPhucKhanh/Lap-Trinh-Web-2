package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Brand;
import com.dongphuckhanh.ltw2.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandRepository brandRepository;

    // 1. Lấy tất cả thương hiệu
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        return ResponseEntity.ok(brandRepository.findAll());
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
    public ResponseEntity<Brand> createBrand(@RequestBody Brand brand) {
        Brand saved = brandRepository.save(brand);
        return ResponseEntity.ok(saved);
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
        brandRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa thương hiệu thành công!");
    }
}
