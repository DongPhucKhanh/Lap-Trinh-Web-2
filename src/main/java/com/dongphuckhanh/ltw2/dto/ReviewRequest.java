package com.dongphuckhanh.ltw2.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long productId;
    private Long orderId;
    private int rating;
    private String comment;
}
