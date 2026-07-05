package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);

    @Query("SELECT v FROM Voucher v WHERE v.status = 1 AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit) AND (v.startDate IS NULL OR v.startDate <= :now) AND (v.endDate IS NULL OR v.endDate >= :now)")
    List<Voucher> findActiveVouchers(@Param("now") Date now);
}
