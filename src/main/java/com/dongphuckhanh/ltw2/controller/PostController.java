package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Post;
import com.dongphuckhanh.ltw2.repository.PostRepository;
import com.dongphuckhanh.ltw2.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private TopicRepository topicRepository;

    // 1. Lấy tất cả bài viết
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAll());
    }

    // 2. Lấy bài viết theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Lấy danh sách bài viết theo Topic ID
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<Post>> getPostsByTopic(@PathVariable Long topicId) {
        // Dùng findAll và lọc theo topic để tránh cần thêm method vào repository
        List<Post> allPosts = postRepository.findAll();
        List<Post> filtered = allPosts.stream()
                .filter(p -> p.getTopic() != null && p.getTopic().getId().equals(topicId))
                .toList();
        return ResponseEntity.ok(filtered);
    }

    // 4. Thêm mới bài viết (cần truyền topic.id trong JSON)
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post post) {
        if (post.getTopic() == null || post.getTopic().getId() == null) {
            return ResponseEntity.badRequest().body("Vui lòng cung cấp ID của chủ đề (topic.id)");
        }

        Optional<com.dongphuckhanh.ltw2.entity.Topic> topicOptional =
                topicRepository.findById(post.getTopic().getId());

        if (topicOptional.isPresent()) {
            post.setTopic(topicOptional.get());
            return ResponseEntity.ok(postRepository.save(post));
        } else {
            return ResponseEntity.badRequest().body("Chủ đề không tồn tại!");
        }
    }

    // 5. Cập nhật bài viết theo ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Post postDetails) {
        Optional<Post> postOptional = postRepository.findById(id);
        if (postOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = postOptional.get();
        post.setTitle(postDetails.getTitle());
        post.setSlug(postDetails.getSlug());
        post.setDetail(postDetails.getDetail());
        post.setDescription(postDetails.getDescription());
        post.setImage(postDetails.getImage());
        post.setType(postDetails.getType());
        post.setStatus(postDetails.getStatus());
        post.setUpdatedBy(postDetails.getUpdatedBy());

        // Cập nhật topic nếu có thay đổi
        if (postDetails.getTopic() != null && postDetails.getTopic().getId() != null) {
            Optional<com.dongphuckhanh.ltw2.entity.Topic> topicOpt =
                    topicRepository.findById(postDetails.getTopic().getId());
            if (topicOpt.isPresent()) {
                post.setTopic(topicOpt.get());
            } else {
                return ResponseEntity.badRequest().body("Chủ đề không tồn tại!");
            }
        }

        return ResponseEntity.ok(postRepository.save(post));
    }

    // 6. Xóa bài viết theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        if (!postRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        postRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa bài viết thành công!");
    }
}
