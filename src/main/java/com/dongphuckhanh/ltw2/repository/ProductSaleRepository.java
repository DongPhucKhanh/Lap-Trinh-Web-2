package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.ProductSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho ProductSale entity - quản lý khuyến mãi.
 */
@Repository
public interface ProductSaleRepository extends JpaRepository<ProductSale, Long> {

    Optional<ProductSale> findByProductId(Long productId);

    /**
     * Lấy danh sách sản phẩm đang có khuyến mãi hiệu lực tại ngày hiện tại.
     */
    @Query("""
            SELECT ps FROM ProductSale ps
            WHERE ps.dateBegin <= :today
              AND ps.dateEnd >= :today
            """)
    List<ProductSale> findActiveSales(@Param("today") LocalDate today);

    /**
     * Tìm khuyến mãi hiệu lực cho một sản phẩm cụ thể.
     */
    @Query("""
            SELECT ps FROM ProductSale ps
            WHERE ps.product.id = :productId
              AND ps.dateBegin <= :today
              AND ps.dateEnd >= :today
            """)
    Optional<ProductSale> findActiveSaleByProductId(@Param("productId") Long productId,
                                                     @Param("today") LocalDate today);
}
