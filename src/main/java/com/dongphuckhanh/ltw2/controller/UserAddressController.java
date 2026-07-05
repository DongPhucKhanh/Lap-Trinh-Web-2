package com.dongphuckhanh.ltw2.controller;

import com.dongphuckhanh.ltw2.entity.User;
import com.dongphuckhanh.ltw2.entity.UserAddress;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import com.dongphuckhanh.ltw2.repository.UserAddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-addresses")
public class UserAddressController {

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAddress>> getUserAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(userAddressRepository.findByUserId(userId));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> addAddress(@RequestBody UserAddress addressRequest) {
        if (addressRequest.getUser() == null || addressRequest.getUser().getId() == null) {
            return ResponseEntity.badRequest().body("User ID is required.");
        }

        Optional<User> userOpt = userRepository.findById(addressRequest.getUser().getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        User user = userOpt.get();
        addressRequest.setUser(user);

        // If this is the first address, make it default automatically
        List<UserAddress> existing = userAddressRepository.findByUserId(user.getId());
        if (existing.isEmpty()) {
            addressRequest.setIsDefault(true);
        }

        // If it is set to default, unset all other defaults for this user
        if (Boolean.TRUE.equals(addressRequest.getIsDefault())) {
            userAddressRepository.unsetDefaultForUser(user.getId());
        } else {
            addressRequest.setIsDefault(false);
        }

        return ResponseEntity.ok(userAddressRepository.save(addressRequest));
    }

    @PutMapping("/{id}/default")
    @Transactional
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long id) {
        Optional<UserAddress> addrOpt = userAddressRepository.findById(id);
        if (addrOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        UserAddress addr = addrOpt.get();
        // Unset all others
        userAddressRepository.unsetDefaultForUser(addr.getUser().getId());
        // Set this to true
        addr.setIsDefault(true);
        userAddressRepository.save(addr);

        return ResponseEntity.ok(addr);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        if (!userAddressRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userAddressRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
