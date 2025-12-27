package com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.dto.BlogCommentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.dto.BlogDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.service.BlogInteractionService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.service.BlogService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Blog;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.BlogLikeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {
    private final BlogService blogService;
    private final BlogInteractionService blogInteractionService;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final BlogLikeRepository blogLikeRepository;

    private BlogDTO toDTO(Blog blog) {
        BlogDTO dto = new BlogDTO();
        dto.setId(blog.getId());
        dto.setTitle(blog.getTitle());
        dto.setContent(blog.getContent());
        dto.setStatus(blog.getStatus());
        dto.setImageUrl(blog.getImageUrl());
        dto.setCreatedAt(blog.getCreatedAt());
        dto.setUpdatedAt(blog.getUpdatedAt());
        if (blog.getDoctor() != null && blog.getDoctor().getUser() != null) {
            dto.setDoctorName(blog.getDoctor().getUser().getFullName());
        }
        // Set default values for interaction fields
        dto.setLikeCount(0);
        dto.setCommentCount(0);
        dto.setLikedByCurrentUser(false);
        dto.setComments(new ArrayList<>());
        return dto;
    }

    // Lấy tất cả blog đã đăng (public)
    @GetMapping("/public")
    public ResponseEntity<List<BlogDTO>> getAllPublishedBlogs(Authentication authentication) {
        try {
            System.out.println("=== GET PUBLIC BLOGS DEBUG ===");
            System.out.println("Authentication: " + (authentication != null ? authentication.getName() : "anonymous"));

            List<BlogDTO> blogs = blogService.getAllBlogs().stream()
                    .filter(b -> "PUBLISHED".equals(b.getStatus()))
                    .map(blog -> {
                        BlogDTO dto = toDTO(blog);
                        if (authentication != null) {
                            try {
                                dto.setLikeCount(blogInteractionService.getLikeCount(blog.getId()));
                                dto.setCommentCount(blogInteractionService.getCommentCount(blog.getId()));
                                dto.setLikedByCurrentUser(
                                        blogInteractionService.isLikedByUser(blog.getId(), authentication));
                                dto.setComments(blogInteractionService.getComments(blog.getId()));
                            } catch (Exception e) {
                                System.err.println(
                                        "Error getting interactions for blog " + blog.getId() + ": " + e.getMessage());
                            }
                        }
                        return dto;
                    }).toList();

            System.out.println("Returning " + blogs.size() + " published blogs");
            return ResponseEntity.ok(blogs);
        } catch (Exception e) {
            System.err.println("Error in getAllPublishedBlogs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    // Lấy tất cả blog của bác sĩ hiện tại
    @GetMapping("/doctor/me")
    public ResponseEntity<List<BlogDTO>> getMyBlogs(@AuthenticationPrincipal UserDetails userDetails) {
        Doctor doctor = doctorRepository.findByUserEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        List<BlogDTO> blogs = blogService.getBlogsByDoctor(doctor).stream().map(this::toDTO).toList();
        return ResponseEntity.ok(blogs);
    }

    // Tạo blog mới
    @PostMapping
    public ResponseEntity<Blog> createBlog(@RequestBody Blog blog, @AuthenticationPrincipal UserDetails userDetails) {
        Doctor doctor = doctorRepository.findByUserEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        blog.setDoctor(doctor);
        blog.setStatus("DRAFT");
        return ResponseEntity.ok(blogService.createBlog(blog));
    }

    // Sửa blog
    @PutMapping("/{id}")
    public ResponseEntity<Blog> updateBlog(@PathVariable Integer id, @RequestBody Blog blog,
            @AuthenticationPrincipal UserDetails userDetails) {
        Doctor doctor = doctorRepository.findByUserEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        Blog existing = blogService.getBlogById(id);
        if (!existing.getDoctor().getId().equals(doctor.getId())) {
            return ResponseEntity.status(403).build();
        }
        blog.setDoctor(doctor);
        return ResponseEntity.ok(blogService.updateBlog(id, blog));
    }

    // Xóa blog
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Integer id, @AuthenticationPrincipal UserDetails userDetails) {
        Doctor doctor = doctorRepository.findByUserEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        Blog existing = blogService.getBlogById(id);
        if (!existing.getDoctor().getId().equals(doctor.getId())) {
            return ResponseEntity.status(403).build();
        }
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }

    // Đăng blog
    @PatchMapping("/{id}/publish")
    public ResponseEntity<Blog> publishBlog(@PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Doctor doctor = doctorRepository.findByUserEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        Blog existing = blogService.getBlogById(id);
        if (!existing.getDoctor().getId().equals(doctor.getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(blogService.publishBlog(id));
    }

    // Ẩn blog
    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<Blog> unpublishBlog(@PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Doctor doctor = doctorRepository.findByUserEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        Blog existing = blogService.getBlogById(id);
        if (!existing.getDoctor().getId().equals(doctor.getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(blogService.unpublishBlog(id));
    }

    // Like/Unlike blog
    @PostMapping("/{id}/like")
    public ResponseEntity<BlogDTO> likeBlog(@PathVariable Integer id, Authentication authentication) {
        try {
            System.out.println("Like blog with ID: " + id);
            blogInteractionService.likeBlog(id, authentication);
            return ResponseEntity.ok(getBlogWithInteractions(id, authentication));
        } catch (Exception e) {
            System.err.println("Error in likeBlog: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<BlogDTO> unlikeBlog(@PathVariable Integer id, Authentication authentication) {
        try {
            System.out.println("=== UNLIKE BLOG CONTROLLER DEBUG ===");
            System.out.println("Blog ID: " + id);
            System.out.println("User: " + authentication.getName());

            blogInteractionService.unlikeBlog(id, authentication);
            System.out.println("Unlike operation completed successfully");

            // Luôn trả về success, ngay cả khi không có like để xóa
            BlogDTO result = getBlogWithInteractions(id, authentication);
            System.out.println("Returning updated blog data");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error in unlikeBlog controller: " + e.getMessage());
            e.printStackTrace();
            // Vẫn trả về success để frontend không bị lỗi
            try {
                return ResponseEntity.ok(getBlogWithInteractions(id, authentication));
            } catch (Exception ex) {
                System.err.println("Error getting blog data after unlike: " + ex.getMessage());
                return ResponseEntity.status(500).body(null);
            }
        }
    }

    // Comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<BlogCommentDTO> addComment(@PathVariable Integer id, @RequestBody String content,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(blogInteractionService.addComment(id, content, authentication));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<BlogCommentDTO> updateComment(@PathVariable Integer commentId, @RequestBody String content,
            Authentication authentication) {
        return ResponseEntity.ok(blogInteractionService.updateComment(commentId, content, authentication));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer commentId, Authentication authentication) {
        blogInteractionService.deleteComment(commentId, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<BlogCommentDTO>> getComments(@PathVariable Integer id) {
        return ResponseEntity.ok(blogInteractionService.getComments(id));
    }

    // Get blog with interactions
    @GetMapping("/{id}/detail")
    public ResponseEntity<BlogDTO> getBlogDetail(@PathVariable Integer id, Authentication authentication) {
        try {
            BlogDTO result = getBlogWithInteractions(id, authentication);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }



    // Test like/unlike functionality
    @GetMapping("/test-like/{blogId}")
    public ResponseEntity<String> testLike(@PathVariable Integer blogId, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.ok("No authentication");
            }

            Blog blog = blogService.getBlogById(blogId);
            User user = userRepository.findByEmailWithRole(authentication.getName()).orElse(null);

            if (user == null) {
                return ResponseEntity.ok("User not found");
            }

            boolean isLiked = blogLikeRepository.existsByBlogAndUser(blog, user);
            long likeCount = blogLikeRepository.countByBlog(blog);

            // Thêm debug chi tiết
            System.out.println("=== TEST LIKE DEBUG ===");
            System.out.println("Blog ID: " + blogId);
            System.out.println("Blog Title: " + blog.getTitle());
            System.out.println("User Email: " + user.getEmail());
            System.out.println("User Name: " + user.getFullName());
            System.out.println("Is Liked: " + isLiked);
            System.out.println("Like Count: " + likeCount);

            return ResponseEntity.ok(String.format("Blog: %s, User: %s, IsLiked: %s, LikeCount: %d",
                    blog.getTitle(), user.getFullName(), isLiked, likeCount));
        } catch (Exception e) {
            System.err.println("Test Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Test Error: " + e.getMessage());
        }
    }

    private BlogDTO getBlogWithInteractions(Integer blogId, Authentication authentication) {
        try {
            System.out.println("=== GET BLOG WITH INTERACTIONS DEBUG ===");
            System.out.println("Blog ID: " + blogId);
            System.out.println("Authentication: " + (authentication != null ? authentication.getName() : "null"));

            Blog blog = blogService.getBlogById(blogId);
            BlogDTO dto = toDTO(blog);

            long likeCount = blogInteractionService.getLikeCount(blogId);
            long commentCount = blogInteractionService.getCommentCount(blogId);
            boolean isLiked = blogInteractionService.isLikedByUser(blogId, authentication);
            List<BlogCommentDTO> comments = blogInteractionService.getComments(blogId);

            System.out.println("Like Count: " + likeCount);
            System.out.println("Comment Count: " + commentCount);
            System.out.println("Is Liked: " + isLiked);
            System.out.println("Comments Count: " + comments.size());

            dto.setLikeCount(likeCount);
            dto.setCommentCount(commentCount);
            dto.setLikedByCurrentUser(isLiked);
            dto.setComments(comments);

            System.out.println("Final DTO - IsLikedByCurrentUser: " + dto.isLikedByCurrentUser());

            return dto;
        } catch (Exception e) {
            System.err.println("Error in getBlogWithInteractions: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}