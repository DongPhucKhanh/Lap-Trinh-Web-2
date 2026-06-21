package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho Contact entity.
 */
@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    /** Lấy tất cả liên hệ của một user */
    List<Contact> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Lấy liên hệ theo trạng thái (0=chưa đọc, 1=đã đọc, 2=đã trả lời) */
    List<Contact> findByStatusOrderByCreatedAtDesc(Integer status);

    /** Đếm số liên hệ chưa đọc */
    Long countByStatus(Integer status);

    /** Lấy tất cả phản hồi của một contact gốc */
    List<Contact> findByReplyId(Long replyId);

    /** Tìm kiếm liên hệ theo email hoặc tiêu đề */
    @Query("""
            SELECT c FROM Contact c
            WHERE LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY c.createdAt DESC
            """)
    List<Contact> searchContacts(@Param("keyword") String keyword);

    /** Lấy danh sách liên hệ gốc (không phải reply) */
    List<Contact> findByReplyIdIsNullOrderByCreatedAtDesc();
}
