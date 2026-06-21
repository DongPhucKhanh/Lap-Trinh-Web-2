package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho Product entity.
 * Cung cấp các query tìm kiếm, lọc sản phẩm theo nhiều tiêu chí.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    /** Tìm sản phẩm theo CategoryId và trạng thái, có phân trang */
    Page<Product> findByCategoryIdAndStatus(Long categoryId, Integer status, Pageable pageable);

    /** Tìm sản phẩm theo BrandId */
    Page<Product> findByBrandIdAndStatus(Long brandId, Integer status, Pageable pageable);

    /** Tìm sản phẩm theo CategoryId không phân trang (dùng cho admin) */
    List<Product> findByCategoryId(Long categoryId);

    /** Tìm kiếm full-text theo tên sản phẩm */
    @Query("SELECT p FROM Product p WHERE p.status = 1 AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> searchByName(@Param("keyword") String keyword, Pageable pageable);

    /** Tìm sản phẩm trong khoảng giá */
    @Query("SELECT p FROM Product p WHERE p.status = 1 AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceBetween(@Param("minPrice") BigDecimal minPrice,
                                     @Param("maxPrice") BigDecimal maxPrice,
                                     Pageable pageable);

    /**
     * Tìm sản phẩm nổi bật (có khuyến mãi đang hiệu lực).
     * Join với ProductSale để kiểm tra ngày hiệu lực.
     */
    @Query("""
            SELECT p FROM Product p
            JOIN p.productSale ps
            WHERE p.status = 1
              AND ps.dateBegin <= CURRENT_DATE
              AND ps.dateEnd >= CURRENT_DATE
            ORDER BY ps.pricesale ASC
            """)
    List<Product> findProductsOnSale(Pageable pageable);

    /** Sản phẩm mới nhất theo ngày tạo */
    List<Product> findTop8ByStatusOrderByCreatedAtDesc(Integer status);

    /**
     * Tìm kiếm nâng cao: theo tên, category, brand, price range.
     * Các tham số có thể null (tìm tất cả).
     */
    @Query("""
            SELECT DISTINCT p FROM Product p
            WHERE p.status = 1
              AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:categoryId IS NULL OR p.category.id = :categoryId)
              AND (:brandId IS NULL OR p.brand.id = :brandId)
              AND (:minPrice IS NULL OR p.price >= :minPrice)
              AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            """)
    Page<Product> advancedSearch(@Param("keyword") String keyword,
                                  @Param("categoryId") Long categoryId,
                                  @Param("brandId") Long brandId,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  Pageable pageable);
}