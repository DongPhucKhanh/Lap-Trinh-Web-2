package com.dongphuckhanh.ltw2.repository;

import com.dongphuckhanh.ltw2.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Topic entity.
 */
@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    Optional<Topic> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    List<Topic> findByStatusOrderBySortOrderAsc(Integer status);
}
