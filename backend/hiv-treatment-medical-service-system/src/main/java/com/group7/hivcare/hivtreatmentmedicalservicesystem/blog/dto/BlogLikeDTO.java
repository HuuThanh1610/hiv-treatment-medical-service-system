package com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogLikeDTO {
    private Integer id;
    private Integer blogId;
    private String userName;
    private LocalDateTime createdAt;
}