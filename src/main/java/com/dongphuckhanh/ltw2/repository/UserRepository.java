package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho User entity.
 * Cung cấp các method để tìm user theo username, email - cần thiết cho Spring Security.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm user theo username - dùng cho UserDetailsService trong Spring Security.
     */
    Optional<User> findByUsername(String username);

    /**
     * Tìm user theo email - dùng cho chức năng quên mật khẩu.
     */
    Optional<User> findByEmail(String email);

    /** Kiểm tra username đã tồn tại chưa */
    boolean existsByUsername(String username);

    /** Kiểm tra email đã tồn tại chưa */
    boolean existsByEmail(String email);

    /** Lấy danh sách user theo trạng thái */
    List<User> findByStatusOrderByCreatedAtDesc(Integer status);

    /** Tìm kiếm user theo tên hoặc email */
    @Query("""
            SELECT u FROM User u
            WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    List<User> searchUsers(@Param("keyword") String keyword);

    /** Lấy user theo role (tìm ROLE_ADMIN, ROLE_USER, ...) */
    @Query("SELECT u FROM User u WHERE u.roles LIKE %:role%")
    List<User> findByRole(@Param("role") String role);
}