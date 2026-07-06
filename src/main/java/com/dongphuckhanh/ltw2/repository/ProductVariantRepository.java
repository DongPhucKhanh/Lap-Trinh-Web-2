package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductId(Long productId);
    java.util.Optional<ProductVariant> findByProductIdAndColorAndSize(Long productId, String color, String size);
}
