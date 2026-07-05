package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "user_address")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user"})
@EqualsAndHashCode(exclude = {"user"})
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "orders", "contacts", "favoriteProducts", "password", "roles"})
    private User user;

    @Column(name = "receiver_name", length = 200)
    private String receiverName;

    @Column(length = 20)
    private String phone;

    @Column(name = "address_line", columnDefinition = "TEXT", nullable = false)
    private String addressLine;

    @Column(name = "is_default", columnDefinition = "TINYINT DEFAULT 0")
    private Boolean isDefault;
}
