import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DoctorBlog.scss';
import { toast } from 'react-toastify';

const API_BASE = 'http://localhost:8080/api/blogs';

const initialForm = {
    title: '',
    content: '',
    imageUrl: '',
    status: 'DRAFT',
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function DoctorBlog() {
    const [blogs, setBlogs] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');
    const [previewImg, setPreviewImg] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [expanded, setExpanded] = useState({});

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/doctor/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBlogs(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast.error('Không thể tải danh sách blog');
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ảnh quá lớn, vui lòng chọn ảnh < 2MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImg(reader.result);
            setForm((prev) => ({ ...prev, imageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setForm(initialForm);
        setPreviewImg('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) {
            toast.error('Vui lòng nhập tiêu đề và nội dung');
            return;
        }
        setLoading(true);
        try {
            if (editingId) {
                await axios.put(`${API_BASE}/${editingId}`, form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Cập nhật blog thành công!');
            } else {
                await axios.post(API_BASE, form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Tạo blog thành công!');
            }
            setForm(initialForm);
            setEditingId(null);
            setPreviewImg('');
            setShowModal(false);
            fetchBlogs();
        } catch (err) {
            toast.error('Có lỗi khi lưu blog');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (blog) => {
        setEditingId(blog.id);
        setForm({
            title: blog.title,
            content: blog.content,
            imageUrl: blog.imageUrl || '',
            status: blog.status,
        });
        setPreviewImg(blog.imageUrl || '');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
        setLoading(true);
        try {
            await axios.delete(`${API_BASE}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Đã xóa blog!');
            fetchBlogs();
        } catch (err) {
            toast.error('Không thể xóa blog');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id, publish) => {
        setLoading(true);
        try {
            await axios.patch(`${API_BASE}/${id}/${publish ? 'publish' : 'unpublish'}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(publish ? 'Đã đăng blog!' : 'Đã chuyển về nháp!');
            fetchBlogs();
        } catch (err) {
            toast.error('Không thể thay đổi trạng thái blog');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm(initialForm);
        setPreviewImg('');
        setShowModal(false);
    };

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="doctor-blog-page profile-content">
            <h2>Quản lý Blog</h2>
            <button className="save-button" style={{ marginBottom: 20 }} onClick={openCreateModal}>Tạo blog mới</button>
            {loading && <div className="loading-overlay"><div className="loading-spinner"></div></div>}
            {showModal && (
                <div className="blog-modal-overlay">
                    <div className="blog-modal">
                        <h3>{editingId ? 'Sửa blog' : 'Tạo blog mới'}</h3>
                        <form className="blog-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tiêu đề</label>
                                <input type="text" name="title" value={form.title} onChange={handleInput} required />
                            </div>
                            <div className="form-group">
                                <label>Nội dung</label>
                                <textarea name="content" value={form.content} onChange={handleInput} rows={8} required />
                            </div>
                            <div className="form-group">
                                <label>Ảnh đại diện</label>
                                <input type="file" accept="image/*" onChange={handleImage} />
                                {previewImg && <img src={previewImg} alt="preview" className="blog-preview-img" />}
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-button" disabled={loading}>
                                    {editingId ? 'Cập nhật' : 'Đăng bài'}
                                </button>
                                <button type="button" className="cancel-button" onClick={handleCancel}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <hr />
            <div className="blog-filter">
                <input
                    type="text"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Tìm kiếm tiêu đề..."
                />
            </div>
            <h3>Danh sách Blog của bạn</h3>
            <div className="blog-list">
                {filteredBlogs.length === 0 && <div>Không có bài viết nào.</div>}
                {filteredBlogs.map(blog => {
                    const isLong = blog.content.length > 300;
                    const showAll = expanded[blog.id];
                    return (
                        <div className="blog-item" key={blog.id}>
                            <div className="blog-header">
                                <h4>{blog.title}</h4>
                                <span className={`blog-status ${blog.status === 'PUBLISHED' ? 'published' : 'draft'}`}>{blog.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}</span>
                            </div>
                            <div className="blog-meta">Ngày tạo: {formatDate(blog.createdAt)}</div>
                            {blog.imageUrl && <img src={blog.imageUrl} alt="blog" className="blog-preview-img" />}
                            <div className="blog-content">
                                {isLong && !showAll ? (
                                    <>
                                        {blog.content.slice(0, 300)}... <button className="see-more-btn" onClick={() => toggleExpand(blog.id)}>Xem thêm</button>
                                    </>
                                ) : isLong ? (
                                    <>
                                        {blog.content} <button className="see-more-btn" onClick={() => toggleExpand(blog.id)}>Thu gọn</button>
                                    </>
                                ) : blog.content}
                            </div>
                            <div className="blog-actions">
                                <button onClick={() => handleEdit(blog)}>Sửa</button>
                                <button onClick={() => handleDelete(blog.id)}>Xóa</button>
                                {blog.status === 'DRAFT' ? (
                                    <button onClick={() => handlePublish(blog.id, true)}>Đăng</button>
                                ) : (
                                    <button onClick={() => handlePublish(blog.id, false)}>Chuyển về nháp</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 