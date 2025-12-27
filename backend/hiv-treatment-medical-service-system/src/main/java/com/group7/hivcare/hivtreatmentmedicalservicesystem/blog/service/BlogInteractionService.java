package com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.dto.BlogCommentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.dto.BlogLikeDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface BlogInteractionService {
    BlogLikeDTO likeBlog(Integer blogId, Authentication authentication);

    void unlikeBlog(Integer blogId, Authentication authentication);

    boolean isLikedByUser(Integer blogId, Authentication authentication);

    long getLikeCount(Integer blogId);

    BlogCommentDTO addComment(Integer blogId, String content, Authentication authentication);

    BlogCommentDTO updateComment(Integer commentId, String content, Authentication authentication);

    void deleteComment(Integer commentId, Authentication authentication);

    List<BlogCommentDTO> getComments(Integer blogId);

    long getCommentCount(Integer blogId);
}