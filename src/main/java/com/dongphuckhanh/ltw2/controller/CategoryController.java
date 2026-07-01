package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Category;
import com.dongphuckhanh.ltw2.repository.CategoryRepository;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    // Lấy danh sách tất cả danh mục
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    // Thêm mới một danh mục
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    // Cập nhật danh mục
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setName(categoryDetails.getName());
                    category.setSlug(categoryDetails.getSlug());
                    category.setDescription(categoryDetails.getDescription());
                    category.setImage(categoryDetails.getImage());
                    category.setParentId(categoryDetails.getParentId());
                    category.setSortOrder(categoryDetails.getSortOrder());
                    category.setStatus(categoryDetails.getStatus());
                    category.setUpdatedBy(categoryDetails.getUpdatedBy());
                    return ResponseEntity.ok(categoryRepository.save(category));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Xóa một danh mục
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Kiểm tra xem danh mục có đang được sử dụng bởi sản phẩm nào không
        List<com.dongphuckhanh.ltw2.entity.Product> products = productRepository.findByCategoryId(id);
        if (products != null && !products.isEmpty()) {
            return ResponseEntity.badRequest().body("Không thể xóa danh mục này vì đang có " + products.size() + " sản phẩm thuộc danh mục này.");
        }
        
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}