package com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Blog;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import java.util.List;

public interface BlogService {
    Blog createBlog(Blog blog);

    Blog updateBlog(Integer id, Blog blog);

    void deleteBlog(Integer id);

    Blog getBlogById(Integer id);

    List<Blog> getBlogsByDoctor(Doctor doctor);

    List<Blog> getAllBlogs();

    Blog publishBlog(Integer id);

    Blog unpublishBlog(Integer id);
}