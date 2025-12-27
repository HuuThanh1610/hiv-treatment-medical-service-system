import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment } from '@fortawesome/free-solid-svg-icons';
import '../DoctorProfile/DoctorBlog.scss';

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function BlogCommunity() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [filter, setFilter] = useState('');
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlogs();

        // Refresh blogs when user returns from detail page
        const handleFocus = () => {
            fetchBlogs();
        };

        // Auto refresh every 30 seconds to keep data updated
        const interval = setInterval(fetchBlogs, 30000);

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, [lastRefresh]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get('http://localhost:8080/api/blogs/public', { headers });
            setBlogs(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching blogs:', err);
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="doctor-blog-page profile-content" style={{ marginTop: '90px' }}>
            <h2>Blog cộng đồng</h2>
            <div className="blog-filter">
                <input
                    type="text"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Tìm kiếm tiêu đề..."
                />
            </div>
            {loading && <div className="loading-overlay"><div className="loading-spinner"></div></div>}
            <div className="blog-list">
                {filteredBlogs.length === 0 && <div>Không có bài viết nào.</div>}
                {filteredBlogs.map(blog => {
                    const isLong = blog.content.length > 300;
                    const showAll = expanded[blog.id];
                    return (
                        <div
                            className="blog-item"
                            key={blog.id}
                            onClick={() => {
                                // Refresh data before navigating
                                setLastRefresh(Date.now());
                                navigate(`/user/blog/${blog.id}`);
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="blog-header">
                                <h4>{blog.title}</h4>
                                <span className="blog-status published">Đã đăng</span>
                            </div>
                            <div className="blog-meta">Ngày đăng: {formatDate(blog.createdAt)}</div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#666', marginTop: 8 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <FontAwesomeIcon
                                        icon={faHeart}
                                        style={{
                                            fontSize: 10,
                                            color: blog.isLikedByCurrentUser ? '#e91e63' : '#666',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                    {blog.likeCount || 0}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <FontAwesomeIcon icon={faComment} style={{ fontSize: 10 }} />
                                    {blog.commentCount || 0}
                                </span>
                            </div>
                            {blog.imageUrl && <img src={blog.imageUrl} alt="blog" className="blog-preview-img" />}
                            <div className="blog-content">
                                {isLong && !showAll ? (
                                    <>
                                        {blog.content.slice(0, 300)}... <button className="see-more-btn" onClick={e => { e.stopPropagation(); toggleExpand(blog.id); }}>Xem thêm</button>
                                    </>
                                ) : isLong ? (
                                    <>
                                        {blog.content} <button className="see-more-btn" onClick={e => { e.stopPropagation(); toggleExpand(blog.id); }}>Thu gọn</button>
                                    </>
                                ) : blog.content}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 