package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Category entity.
 * Cung cấp các query tìm danh mục theo slug, trạng thái, và cấu trúc cây.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /** Tìm danh mục theo slug (dùng cho SEO-friendly URL) */
    Optional<Category> findBySlug(String slug);

    /** Kiểm tra slug đã tồn tại chưa (dùng khi tạo/sửa) */
    boolean existsBySlug(String slug);

    /** Kiểm tra slug tồn tại nhưng không phải chính nó (dùng khi update) */
    boolean existsBySlugAndIdNot(String slug, Long id);

    /** Lấy tất cả danh mục đang active, sắp xếp theo sortOrder */
    List<Category> findByStatusOrderBySortOrderAsc(Integer status);

    /** Lấy danh sách danh mục con theo parentId */
    List<Category> findByParentIdAndStatus(Long parentId, Integer status);

    /** Lấy tất cả danh mục gốc (parentId = null) */
    List<Category> findByParentIdIsNullAndStatusOrderBySortOrderAsc(Integer status);

    /** Đếm số sản phẩm thuộc một danh mục */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
    Long countProductsByCategoryId(@Param("categoryId") Long categoryId);

    /** Tìm kiếm danh mục theo tên (không phân biệt hoa thường) */
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> searchByName(@Param("keyword") String keyword);
}