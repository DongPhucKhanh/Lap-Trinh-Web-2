package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    boolean existsByUserIdAndProductIdAndOrderId(Long userId, Long productId, Long orderId);
    
    @EntityGraph(attributePaths = {"user"})
    List<Review> findTop10ByOrderByCreatedAtDesc();
}
