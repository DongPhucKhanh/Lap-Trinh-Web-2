package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.ProductStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Repository cho ProductStore entity - quản lý tồn kho.
 */
@Repository
public interface ProductStoreRepository extends JpaRepository<ProductStore, Long> {

    /** Tìm thông tin tồn kho theo productId */
    Optional<ProductStore> findByProductId(Long productId);

    /** Kiểm tra tồn kho đủ số lượng yêu cầu không */
    @Query("SELECT CASE WHEN ps.qty >= :requiredQty THEN true ELSE false END FROM ProductStore ps WHERE ps.product.id = :productId")
    boolean isStockSufficient(@Param("productId") Long productId, @Param("requiredQty") Integer requiredQty);

    /**
     * Giảm số lượng tồn kho sau khi đặt hàng thành công.
     * Sử dụng @Modifying để thực hiện UPDATE trực tiếp.
     */
    @Modifying
    @Transactional
    @Query("UPDATE ProductStore ps SET ps.qty = ps.qty - :qty WHERE ps.product.id = :productId AND ps.qty >= :qty")
    int decreaseStock(@Param("productId") Long productId, @Param("qty") Integer qty);

    /**
     * Tăng số lượng tồn kho (khi hủy đơn hàng).
     */
    @Modifying
    @Transactional
    @Query("UPDATE ProductStore ps SET ps.qty = ps.qty + :qty WHERE ps.product.id = :productId")
    int increaseStock(@Param("productId") Long productId, @Param("qty") Integer qty);
}
