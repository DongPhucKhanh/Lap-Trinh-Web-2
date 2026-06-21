package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Post entity.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    /** Lấy bài viết theo chủ đề, có phân trang */
    Page<Post> findByTopicIdAndStatusOrderByCreatedAtDesc(Long topicId, Integer status, Pageable pageable);

    /** Lấy bài viết theo type (news, blog, review, ...) */
    Page<Post> findByTypeAndStatusOrderByCreatedAtDesc(String type, Integer status, Pageable pageable);

    /** Lấy bài viết mới nhất */
    List<Post> findTop6ByStatusOrderByCreatedAtDesc(Integer status);

    /** Tìm kiếm bài viết theo tiêu đề */
    @Query("""
            SELECT p FROM Post p
            WHERE p.status = 1
              AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY p.createdAt DESC
            """)
    Page<Post> searchPosts(@Param("keyword") String keyword, Pageable pageable);
}
