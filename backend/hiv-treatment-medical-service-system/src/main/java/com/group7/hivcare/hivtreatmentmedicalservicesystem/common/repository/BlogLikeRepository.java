package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Blog;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.BlogLike;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogLikeRepository extends JpaRepository<BlogLike, Integer> {
    List<BlogLike> findByBlog(Blog blog);

    Optional<BlogLike> findByBlogAndUser(Blog blog, User user);

    boolean existsByBlogAndUser(Blog blog, User user);

    long countByBlog(Blog blog);
}