package com.dongphuckhanh.ltw2.security;

import com.dongphuckhanh.ltw2.entity.User;
import com.dongphuckhanh.ltw2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collection;
import java.util.stream.Collectors;

/**
 * Cầu nối giữa Spring Security và database.
 * Spring Security gọi loadUserByUsername() mỗi khi cần xác thực.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Tìm user trong DB theo username, sau đó chuyển thành UserDetails
     * mà Spring Security hiểu được.
     */
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy tài khoản: " + username));

        // Chuyển chuỗi "ROLE_USER,ROLE_ADMIN" thành danh sách GrantedAuthority
        Collection<GrantedAuthority> authorities = Arrays.stream(
                user.getRoles().split(","))
                .map(role -> new SimpleGrantedAuthority(role.trim()))
                .collect(Collectors.toList());

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(user.getStatus() == 0) // status=0 => tài khoản bị khóa
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
