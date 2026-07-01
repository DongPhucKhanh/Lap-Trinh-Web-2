package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Product;
import com.dongphuckhanh.ltw2.entity.User;
import com.dongphuckhanh.ltw2.repository.ProductRepository;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@Transactional
public class FavoriteController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Lấy danh sách sản phẩm yêu thích của user đang đăng nhập
     */
    @GetMapping("/favorites")
    public ResponseEntity<?> getMyFavorites(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập!"));
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    List<Product> favorites = new java.util.ArrayList<>(user.getFavoriteProducts());
                    return ResponseEntity.ok(favorites);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Thêm sản phẩm vào danh sách yêu thích
     */
    @PostMapping("/favorites/{productId}")
    public ResponseEntity<?> addFavorite(@PathVariable Long productId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập!"));
        }

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        Optional<Product> productOpt = productRepository.findById(productId);

        if (userOpt.isEmpty() || productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        Product product = productOpt.get();

        if (!user.getFavoriteProducts().contains(product)) {
            user.getFavoriteProducts().add(product);
            userRepository.save(user);
        }

        return ResponseEntity.ok(Map.of("message", "Đã thêm vào danh sách yêu thích", "favoriteIds", getFavoriteIds(user)));
    }

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích
     */
    @DeleteMapping("/favorites/{productId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long productId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập!"));
        }

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        Optional<Product> productOpt = productRepository.findById(productId);

        if (userOpt.isEmpty() || productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        Product product = productOpt.get();

        if (user.getFavoriteProducts().contains(product)) {
            user.getFavoriteProducts().remove(product);
            userRepository.save(user);
        }

        return ResponseEntity.ok(Map.of("message", "Đã xóa khỏi danh sách yêu thích", "favoriteIds", getFavoriteIds(user)));
    }

    /**
     * Dành cho Admin: Xem danh sách yêu thích của một user cụ thể
     */
    @GetMapping("/users/{userId}/favorites")
    public ResponseEntity<?> getUserFavorites(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    List<Product> favorites = new java.util.ArrayList<>(user.getFavoriteProducts());
                    return ResponseEntity.ok(favorites);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private List<Long> getFavoriteIds(User user) {
        return user.getFavoriteProducts().stream().map(Product::getId).toList();
    }
}
