package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho Banner entity.
 */
@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {

    /** Lấy banner theo vị trí hiển thị và trạng thái */
    List<Banner> findByPositionAndStatusOrderBySortOrderAsc(String position, Integer status);

    /** Lấy tất cả banner đang active */
    List<Banner> findByStatusOrderBySortOrderAsc(Integer status);

    /** Đếm banner theo vị trí */
    Long countByPosition(String position);
}
