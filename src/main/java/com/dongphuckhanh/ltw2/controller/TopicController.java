package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Topic;
import com.dongphuckhanh.ltw2.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    @Autowired
    private TopicRepository topicRepository;

    // 1. Lấy tất cả chủ đề bài viết
    @GetMapping
    public ResponseEntity<List<Topic>> getAllTopics() {
        return ResponseEntity.ok(topicRepository.findAll());
    }

    // 2. Lấy chủ đề theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopicById(@PathVariable Long id) {
        return topicRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Thêm mới chủ đề
    @PostMapping
    public ResponseEntity<Topic> createTopic(@RequestBody Topic topic) {
        Topic saved = topicRepository.save(topic);
        return ResponseEntity.ok(saved);
    }

    // 4. Cập nhật chủ đề theo ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTopic(@PathVariable Long id, @RequestBody Topic topicDetails) {
        return topicRepository.findById(id)
                .map(topic -> {
                    topic.setName(topicDetails.getName());
                    topic.setSlug(topicDetails.getSlug());
                    topic.setSortOrder(topicDetails.getSortOrder());
                    topic.setDescription(topicDetails.getDescription());
                    topic.setStatus(topicDetails.getStatus());
                    topic.setUpdatedBy(topicDetails.getUpdatedBy());
                    Topic updated = topicRepository.save(topic);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. Xóa chủ đề theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTopic(@PathVariable Long id) {
        if (!topicRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        topicRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa chủ đề thành công!");
    }
}
