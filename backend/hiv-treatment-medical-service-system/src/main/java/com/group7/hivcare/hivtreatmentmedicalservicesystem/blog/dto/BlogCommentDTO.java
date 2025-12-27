package com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogCommentDTO {
    private Integer id;
    private Integer blogId;
    private String userName;
    private String userEmail;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}