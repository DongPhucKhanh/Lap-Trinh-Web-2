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

    // 1. Lấy tất cả sản phẩm (trừ các món đã xóa mềm)
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findByStatusNot(-1));
    }

    // Lấy danh sách thùng rác
    @GetMapping("/trash")
    public ResponseEntity<List<Product>> getTrashProducts() {
        return ResponseEntity.ok(productRepository.findByStatus(-1));
    }

    // Tìm kiếm sản phẩm với phân trang, lọc theo keyword và category (trừ xóa mềm)
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        org.springframework.data.domain.Sort sortObj = direction.equalsIgnoreCase("asc") 
            ? org.springframework.data.domain.Sort.by(sort).ascending() 
            : org.springframework.data.domain.Sort.by(sort).descending();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sortObj);
        
        org.springframework.data.domain.Page<?> result;
        if (keyword != null && !keyword.isEmpty() && category != null) {
            result = productRepository.findByNameContainingIgnoreCaseAndCategoryIdAndStatusNot(keyword, category, -1, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            result = productRepository.findByNameContainingIgnoreCaseAndStatusNot(keyword, -1, pageable);
        } else if (category != null) {
            result = productRepository.findByCategoryIdAndStatusNot(category, -1, pageable);
        } else {
            result = productRepository.findByStatusNot(-1, pageable);
        }
        
        return ResponseEntity.ok(result);
    }

    // 2. Lấy sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Lấy danh sách sản phẩm theo Category ID
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productRepository.findByCategoryId(categoryId));
    }

    // 4. Thêm sản phẩm mới (Cần truyền category_id vào JSON)
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        if (product.getCategory() == null || product.getCategory().getId() == null) {
            return ResponseEntity.badRequest().body("Vui lòng cung cấp ID của danh mục (category.id)");
        }
        
        java.util.Optional<com.dongphuckhanh.ltw2.entity.Category> categoryOptional = categoryRepository.findById(product.getCategory().getId());
        
        if (categoryOptional.isPresent()) {
            product.setCategory(categoryOptional.get());
            
            // Xử lý Store và Sale
            if (product.getProductStore() != null) {
                product.getProductStore().setProduct(product);
            }
            if (product.getProductSale() != null) {
                product.getProductSale().setProduct(product);
            }
            
            return ResponseEntity.ok(productRepository.save(product));
        } else {
            return ResponseEntity.badRequest().body("Danh mục không tồn tại!");
        }
    }

    // 5. Cập nhật sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(productDetails.getName());
                    product.setSlug(productDetails.getSlug());
                    product.setPrice(productDetails.getPrice());
                    product.setDescription(productDetails.getDescription());
                    product.setDetail(productDetails.getDetail());
                    product.setImage(productDetails.getImage());
                    product.setGallery(productDetails.getGallery());
                    product.setIsFeatured(productDetails.getIsFeatured());
                    product.setStatus(productDetails.getStatus());
                    
                    if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
                        categoryRepository.findById(productDetails.getCategory().getId()).ifPresent(product::setCategory);
                    }
                    if (productDetails.getBrand() != null && productDetails.getBrand().getId() != null) {
                        product.setBrand(productDetails.getBrand());
                    } else {
                        product.setBrand(null);
                    }
                    
                    // Update Store
                    if (productDetails.getProductStore() != null) {
                        if (product.getProductStore() == null) {
                            productDetails.getProductStore().setProduct(product);
                            product.setProductStore(productDetails.getProductStore());
                        } else {
                            product.getProductStore().setPriceroot(productDetails.getProductStore().getPriceroot());
                            product.getProductStore().setQty(productDetails.getProductStore().getQty());
                        }
                    } else {
                        product.setProductStore(null);
                    }

                    // Update Sale
                    if (productDetails.getProductSale() != null) {
                        if (product.getProductSale() == null) {
                            productDetails.getProductSale().setProduct(product);
                            product.setProductSale(productDetails.getProductSale());
                        } else {
                            product.getProductSale().setPricesale(productDetails.getProductSale().getPricesale());
                            product.getProductSale().setDateBegin(productDetails.getProductSale().getDateBegin());
                            product.getProductSale().setDateEnd(productDetails.getProductSale().getDateEnd());
                        }
                    } else {
                        product.setProductSale(null);
                    }

                    return ResponseEntity.ok(productRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. Xóa mềm sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setStatus(-1);
                    productRepository.save(product);
                    return ResponseEntity.ok("Đã chuyển sản phẩm vào thùng rác!");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 7. Khôi phục sản phẩm
    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restoreProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setStatus(1); // Default to active when restored
                    productRepository.save(product);
                    return ResponseEntity.ok("Đã khôi phục sản phẩm!");
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // 8. Cập nhật trạng thái hiển thị
    @PutMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setStatus(product.getStatus() == 1 ? 0 : 1);
                    productRepository.save(product);
                    return ResponseEntity.ok(product);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}