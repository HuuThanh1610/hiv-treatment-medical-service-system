package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Blog;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.BlogComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, Integer> {
    List<BlogComment> findByBlogOrderByCreatedAtDesc(Blog blog);

    long countByBlog(Blog blog);
}