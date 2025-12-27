package com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.dto.BlogCommentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.dto.BlogLikeDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.service.BlogInteractionService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlogInteractionServiceImpl implements BlogInteractionService {
    private final BlogLikeRepository blogLikeRepository;
    private final BlogCommentRepository blogCommentRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public BlogLikeDTO likeBlog(Integer blogId, Authentication authentication) {
        try {
            System.out.println("=== LIKE BLOG DEBUG ===");
            System.out.println("Blog ID: " + blogId);
            System.out.println("User: " + authentication.getName());

            Blog blog = blogRepository.findById(blogId)
                    .orElseThrow(() -> new EntityNotFoundException("Blog không tồn tại"));
            System.out.println("Blog found: " + blog.getTitle());

            User user = userRepository.findByEmailWithRole(authentication.getName())
                    .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
            System.out.println("User found: " + user.getFullName());

            boolean alreadyLiked = blogLikeRepository.existsByBlogAndUser(blog, user);
            System.out.println("Already liked: " + alreadyLiked);

            if (alreadyLiked) {
                System.out.println("User đã like rồi, không làm gì");
                // Trả về like hiện tại thay vì throw exception
                BlogLike existingLike = blogLikeRepository.findByBlogAndUser(blog, user).orElse(null);
                return existingLike != null ? toLikeDTO(existingLike) : null;
            }

            BlogLike like = BlogLike.builder()
                    .blog(blog)
                    .user(user)
                    .build();
            like = blogLikeRepository.save(like);
            System.out.println("Like saved with ID: " + like.getId());

            return toLikeDTO(like);
        } catch (Exception e) {
            System.err.println("ERROR in likeBlog: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi like bài viết: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void unlikeBlog(Integer blogId, Authentication authentication) {
        try {
            System.out.println("=== UNLIKE BLOG DEBUG ===");
            System.out.println("Blog ID: " + blogId);
            System.out.println("User: " + authentication.getName());

            Blog blog = blogRepository.findById(blogId)
                    .orElseThrow(() -> new EntityNotFoundException("Blog không tồn tại"));
            System.out.println("Blog found: " + blog.getTitle());

            User user = userRepository.findByEmailWithRole(authentication.getName())
                    .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
            System.out.println("User found: " + user.getFullName());

            // Kiểm tra xem user đã like chưa
            boolean exists = blogLikeRepository.existsByBlogAndUser(blog, user);
            System.out.println("Like exists: " + exists);

            if (!exists) {
                System.out.println("User chưa like bài viết này");
                return; // Không làm gì nếu chưa like
            }

            // Tìm và xóa like
            BlogLike like = blogLikeRepository.findByBlogAndUser(blog, user)
                    .orElse(null);

            if (like != null) {
                System.out.println("Like found with ID: " + like.getId());
                blogLikeRepository.delete(like);
                System.out.println("Like deleted successfully");
            } else {
                System.out.println("Like not found in database");
            }
        } catch (Exception e) {
            System.err.println("ERROR in unlikeBlog: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi bỏ like bài viết: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean isLikedByUser(Integer blogId, Authentication authentication) {
        try {
            Blog blog = blogRepository.findById(blogId)
                    .orElseThrow(() -> new EntityNotFoundException("Blog không tồn tại"));
            User user = userRepository.findByEmailWithRole(authentication.getName())
                    .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

            return blogLikeRepository.existsByBlogAndUser(blog, user);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public long getLikeCount(Integer blogId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new EntityNotFoundException("Blog không tồn tại"));
        long count = blogLikeRepository.countByBlog(blog);
        System.out.println("=== GET LIKE COUNT DEBUG ===");
        System.out.println("Blog ID: " + blogId);
        System.out.println("Like count: " + count);
        return count;
    }

    @Override
    public long getCommentCount(Integer blogId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new EntityNotFoundException("Blog không tồn tại"));
        long count = blogCommentRepository.countByBlog(blog);
        System.out.println("=== GET COMMENT COUNT DEBUG ===");
        System.out.println("Blog ID: " + blogId);
        System.out.println("Comment count: " + count);
        return count;
    }

    @Override
    @Transactional
    public BlogCommentDTO addComment(Integer blogId, String content, Authentication authentication) {
        try {
            System.out.println("=== ADD COMMENT DEBUG ===");
            System.out.println("Blog ID: " + blogId);
            System.out.println("Content: " + content);
            System.out.println("Content length: " + content.length());
            System.out.println("Content bytes: " + java.util.Arrays.toString(content.getBytes("UTF-8")));

            Blog blog = blogRepository.findById(blogId)
                    .orElseThrow(() -> new EntityNotFoundException("Blog không tồn tại"));
            User user = userRepository.findByEmailWithRole(authentication.getName())
                    .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

            // Sử dụng content trực tiếp không cần encode
            String sanitizedContent = content;

            BlogComment comment = BlogComment.builder()
                    .blog(blog)
                    .user(user)
                    .content(sanitizedContent)
                    .build();
            comment = blogCommentRepository.save(comment);

            System.out.println("Comment saved with ID: " + comment.getId());
            System.out.println("Saved content: " + comment.getContent());

            return toCommentDTO(comment);
        } catch (Exception e) {
            System.err.println("ERROR in addComment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi thêm comment: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public BlogCommentDTO updateComment(Integer commentId, String content, Authentication authentication) {
        BlogComment comment = blogCommentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment không tồn tại"));
        User user = userRepository.findByEmailWithRole(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Bạn không có quyền chỉnh sửa comment này");
        }

        comment.setContent(content);
        comment = blogCommentRepository.save(comment);

        return toCommentDTO(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Integer commentId, Authentication authentication) {
        BlogComment comment = blogCommentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment không tồn tại"));
        User user = userRepository.findByEmailWithRole(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Bạn không có quyền xóa comment này");
        }

        blogCommentRepository.delete(comment);
    }

    @Override
    public List<BlogCommentDTO> getComments(Integer blogId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new EntityNotFoundException("Blog không tồn tại"));

        return blogCommentRepository.findByBlogOrderByCreatedAtDesc(blog)
                .stream()
                .map(this::toCommentDTO)
                .collect(Collectors.toList());
    }

    private BlogLikeDTO toLikeDTO(BlogLike like) {
        BlogLikeDTO dto = new BlogLikeDTO();
        dto.setId(like.getId());
        dto.setBlogId(like.getBlog().getId());
        dto.setUserName(like.getUser().getFullName());
        dto.setCreatedAt(like.getCreatedAt());
        return dto;
    }

    private BlogCommentDTO toCommentDTO(BlogComment comment) {
        BlogCommentDTO dto = new BlogCommentDTO();
        dto.setId(comment.getId());
        dto.setBlogId(comment.getBlog().getId());
        dto.setUserName(comment.getUser().getFullName());
        dto.setUserEmail(comment.getUser().getEmail());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}