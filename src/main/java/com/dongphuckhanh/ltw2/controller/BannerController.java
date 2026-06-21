package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.Banner;
import com.dongphuckhanh.ltw2.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    // 1. Lấy tất cả banner
    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerRepository.findAll());
    }

    // 2. Lấy banner theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable Long id) {
        return bannerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Lấy banner theo vị trí hiển thị (position)
    //    Ví dụ: GET /api/banners/position/home-top
    @GetMapping("/position/{position}")
    public ResponseEntity<List<Banner>> getBannersByPosition(@PathVariable String position) {
        // Lấy các banner active (status=1) theo vị trí, sắp xếp theo sortOrder
        List<Banner> banners = bannerRepository.findByPositionAndStatusOrderBySortOrderAsc(position, 1);
        return ResponseEntity.ok(banners);
    }

    // 4. Thêm mới banner
    @PostMapping
    public ResponseEntity<Banner> createBanner(@RequestBody Banner banner) {
        Banner saved = bannerRepository.save(banner);
        return ResponseEntity.ok(saved);
    }

    // 5. Cập nhật banner theo ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
        return bannerRepository.findById(id)
                .map(banner -> {
                    banner.setName(bannerDetails.getName());
                    banner.setImage(bannerDetails.getImage());
                    banner.setLink(bannerDetails.getLink());
                    banner.setPosition(bannerDetails.getPosition());
                    banner.setDescription(bannerDetails.getDescription());
                    banner.setSortOrder(bannerDetails.getSortOrder());
                    banner.setStatus(bannerDetails.getStatus());
                    banner.setUpdatedBy(bannerDetails.getUpdatedBy());
                    Banner updated = bannerRepository.save(banner);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. Xóa banner theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        if (!bannerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bannerRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa banner thành công!");
    }
}
