package com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BlogDTO {
    private Integer id;
    private String title;
    private String content;
    private String status;
    private String imageUrl;
    private String doctorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long likeCount;
    private long commentCount;
    private boolean isLikedByCurrentUser;
    private List<BlogCommentDTO> comments;
}