package com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.blog.service.BlogService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Blog;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.BlogRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlogServiceImpl implements BlogService {
    @Autowired
    private BlogRepository blogRepository;
    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public Blog createBlog(Blog blog) {
        return blogRepository.save(blog);
    }

    @Override
    public Blog updateBlog(Integer id, Blog blog) {
        Blog existing = blogRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Blog not found"));
        existing.setTitle(blog.getTitle());
        existing.setContent(blog.getContent());
        existing.setStatus(blog.getStatus());
        existing.setImageUrl(blog.getImageUrl());
        return blogRepository.save(existing);
    }

    @Override
    public void deleteBlog(Integer id) {
        blogRepository.deleteById(id);
    }

    @Override
    public Blog getBlogById(Integer id) {
        return blogRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Blog not found"));
    }

    @Override
    public List<Blog> getBlogsByDoctor(Doctor doctor) {
        return blogRepository.findByDoctor(doctor);
    }

    @Override
    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    @Override
    public Blog publishBlog(Integer id) {
        Blog blog = getBlogById(id);
        blog.setStatus("PUBLISHED");
        return blogRepository.save(blog);
    }

    @Override
    public Blog unpublishBlog(Integer id) {
        Blog blog = getBlogById(id);
        blog.setStatus("DRAFT");
        return blogRepository.save(blog);
    }
}