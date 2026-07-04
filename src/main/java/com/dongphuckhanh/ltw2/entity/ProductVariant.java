package com.dongphuckhanh.ltw2.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_variant")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "product")
@EqualsAndHashCode(exclude = "product")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Product product;

    @Column(length = 100)
    private String color;

    @Column(length = 50)
    private String size;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer qty;

    @Column(columnDefinition = "TEXT")
    private String image;
}
