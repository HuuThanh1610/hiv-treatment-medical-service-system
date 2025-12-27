/**
 * Homepage.jsx - Trang chủ chính của ứng dụng
 *
 * Chức năng:
 * - Landing page với các section chính
 * - Hero banner với video background
 * - Services overview
 * - Benefits và testimonials
 * - Recent blog posts
 * - Call-to-action section
 */
import React from 'react';
import Header from '../Header/Header.jsx';         // Header với navigation
import HeroSection from './HeroSection.jsx';       // Banner chính với video
import ServicesSection from './ServicesSection.jsx'; // Dịch vụ y tế
import BenefitsSection from './BenefitsSection.jsx'; // Lợi ích của hệ thống
import TestimonialsSection from './TestimonialsSection.jsx'; // Đánh giá từ người dùng
import RecentBlogPosts from './RecentBlogPosts.jsx'; // Blog posts mới nhất
import CTASection from './CTASection.jsx';          // Call-to-action buttons

import './Homepage.scss';

const Homepage = () => {
    return (
        <div className="homepage">
            {/* <Header /> */}
            <main>
                <HeroSection />
                <ServicesSection />
                <BenefitsSection />
                <TestimonialsSection />
                <RecentBlogPosts />
                <CTASection />
            </main>
            {/* <Footer /> */}
        </div>
    );
};

export default Homepage;