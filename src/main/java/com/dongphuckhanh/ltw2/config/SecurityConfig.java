package com.dongphuckhanh.ltw2.config;

import com.dongphuckhanh.ltw2.security.AuthTokenFilter;
import com.dongphuckhanh.ltw2.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    // Bean: JWT Filter
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    // Bean: BCrypt password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * DaoAuthenticationProvider nối UserDetailsService + PasswordEncoder.
     * Spring Security 6.4+ (Spring Boot 4.x): UserDetailsService truyền qua constructor.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Bean: AuthenticationManager (dùng trong AuthController để xác thực login)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Tắt CSRF vì dùng JWT (stateless)
            .csrf(AbstractHttpConfigurer::disable)

            // Không lưu session - mỗi request phải tự mang token
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Đăng ký AuthenticationProvider
            .authenticationProvider(authenticationProvider())

            .authorizeHttpRequests(auth -> auth
                // --- CÔNG KHAI hoàn toàn ---
                .requestMatchers(
                    "/api/auth/**",          // Login, Register, /me
                    "/swagger-ui/**",        // Swagger UI
                    "/swagger-ui.html",
                    "/v3/api-docs/**",       // OpenAPI JSON
                    "/api-docs/**"
                ).permitAll()

                // --- KHÁCH VÃNG LAI chỉ được GET ---
                .requestMatchers(HttpMethod.GET,
                    "/api/products", "/api/products/**",
                    "/api/categories", "/api/categories/**",
                    "/api/posts", "/api/posts/**",
                    "/api/topics", "/api/topics/**",
                    "/api/brands", "/api/brands/**",
                    "/api/banners", "/api/banners/**",
                    "/uploads/**",
                    "/error"
                ).permitAll()

                // --- MỌI request còn lại phải có JWT token ---
                .anyRequest().authenticated()
            );

        // Chèn JWT filter trước UsernamePasswordAuthenticationFilter
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}