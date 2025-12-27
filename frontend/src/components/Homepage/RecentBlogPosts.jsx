import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './RecentBlogPosts.scss';

const RecentBlogPosts = () => {
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentPosts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get('http://localhost:8080/api/blogs/public', { headers });
                // Lấy 3 bài viết gần nhất từ API thực tế
                const allPosts = Array.isArray(response.data) ? response.data : [];
                const recentPosts = allPosts
                    .filter(post => post.status === 'PUBLISHED')
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 3);
                setRecentPosts(recentPosts);
            } catch (err) {
                console.error('Error fetching recent blog posts:', err);
                setError('Không thể tải bài viết gần đây');
                // Tạo dữ liệu mẫu nếu API chưa sẵn sàng
                setRecentPosts([
                    {
                        id: 1,
                        title: 'Những điều cần biết về điều trị HIV',
                        content: 'Bài viết cung cấp thông tin quan trọng về các phương pháp điều trị HIV hiện đại và những tiến bộ mới nhất trong y học...',
                        doctorName: 'Dr. Nguyễn Văn A',
                        createdAt: '2024-01-15',
                        imageUrl: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=HIV+Treatment'
                    },
                    {
                        id: 2,
                        title: 'Chế độ dinh dưỡng cho bệnh nhân HIV',
                        content: 'Dinh dưỡng đóng vai trò quan trọng trong việc hỗ trợ điều trị và tăng cường sức khỏe cho bệnh nhân HIV...',
                        doctorName: 'Dr. Trần Thị B',
                        createdAt: '2024-01-10',
                        imageUrl: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Nutrition'
                    },
                    {
                        id: 3,
                        title: 'Tâm lý và hỗ trợ tinh thần cho bệnh nhân',
                        content: 'Việc chăm sóc sức khỏe tâm lý là một phần không thể thiếu trong quá trình điều trị HIV...',
                        doctorName: 'Dr. Lê Văn C',
                        createdAt: '2024-01-05',
                        imageUrl: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Mental+Health'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentPosts();
    }, []);

    if (loading) {
        return (
            <section className="recent-blog-posts">
                <div className="container">
                    <div className="section-header">
                        <h2>Bài viết gần đây</h2>
                        <p>Những thông tin mới nhất về chăm sóc sức khỏe HIV</p>
                    </div>
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Đang tải bài viết...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="recent-blog-posts">
                <div className="container">
                    <div className="section-header">
                        <h2>Bài viết gần đây</h2>
                        <p>Những thông tin mới nhất về chăm sóc sức khỏe HIV</p>
                    </div>
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="recent-blog-posts">
            <div className="container">
                <div className="section-header">
                    <h2>Bài viết gần đây</h2>
                    <p>Những thông tin mới nhất về chăm sóc sức khỏe HIV</p>
                </div>

                <div className="blog-posts-grid">
                    {recentPosts.map((post) => (
                        <article key={post.id} className="blog-post-card">
                            <div className="post-image">
                                <img
                                    src={post.imageUrl || 'https://via.placeholder.com/300x200/3498db/FFFFFF?text=Blog+Post'}
                                    alt={post.title}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x200/3498db/FFFFFF?text=Blog+Post';
                                    }}
                                />
                            </div>
                            <div className="post-content">
                                <div className="post-meta">
                                    <span className="post-author">{post.doctorName || 'Bác sĩ'}</span>
                                    <span className="post-date">
                                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <h3 className="post-title">{post.title}</h3>
                                <p className="post-excerpt">
                                    {post.content && post.content.length > 100
                                        ? `${post.content.substring(0, 100)}...`
                                        : post.content || 'Nội dung bài viết...'
                                    }
                                </p>
                                <Link to={`/user/blog/${post.id}`} className="read-more-btn">
                                    Đọc thêm
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="view-all-posts">
                    <Link to="/user/blog" className="view-all-btn">
                        Xem tất cả bài viết
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RecentBlogPosts; 