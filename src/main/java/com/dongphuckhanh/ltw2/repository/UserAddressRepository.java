package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    
    List<UserAddress> findByUserId(Long userId);

    @Modifying
    @Query("UPDATE UserAddress u SET u.isDefault = false WHERE u.user.id = :userId")
    void unsetDefaultForUser(@Param("userId") Long userId);
}
