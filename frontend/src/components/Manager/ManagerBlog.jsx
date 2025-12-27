import React, { useState } from "react";
import "./ManagerBlog.scss";

function BlogStats({ blogs }) {
    return (
        <div className="blog-stats">
            <span>Tổng số bài viết: {blogs.length}</span>
            <span>Bài viết gần nhất: {blogs[0]?.date || "-"}</span>
        </div>
    );
}

function BlogFilter({ filter, setFilter }) {
    return (
        <div className="blog-filter">
            <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Tìm kiếm tiêu đề..."
            />
        </div>
    );
}

function BlogPreview({ title, content }) {
    return (
        <div className="blog-preview">
            <h4>Xem trước bài viết</h4>
            <div className="preview-title">{title || <i>Chưa có tiêu đề</i>}</div>
            <div className="preview-content">{content || <i>Chưa có nội dung</i>}</div>
        </div>
    );
}

export default function ManagerBlog() {
    const [blogs, setBlogs] = useState([
        {
            id: 1,
            title: "Chào mừng đến với hệ thống quản lý HIVCare",
            content: "Đây là bài viết đầu tiên trên blog của Manager. Hãy chia sẻ thông tin hữu ích cho cộng đồng!",
            date: "2024-06-20",
        },
        {
            id: 2,
            title: "Hướng dẫn sử dụng hệ thống",
            content: "Bài viết này sẽ hướng dẫn bạn cách sử dụng các chức năng chính của hệ thống quản lý HIVCare một cách hiệu quả.",
            date: "2024-06-19",
        },
        {
            id: 3,
            title: "Cập nhật mới nhất về điều trị HIV",
            content: "Chúng tôi vừa cập nhật các phác đồ điều trị HIV mới nhất theo khuyến nghị của Bộ Y tế.",
            date: "2024-06-18",
        },
        {
            id: 4,
            title: "Lời khuyên cho bệnh nhân HIV",
            content: "Những lời khuyên hữu ích giúp bệnh nhân HIV duy trì sức khỏe và tuân thủ điều trị.",
            date: "2024-06-17",
        },
    ]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
            return;
        }
        setBlogs([
            {
                id: Date.now(),
                title,
                content,
                date: new Date().toISOString().slice(0, 10),
            },
            ...blogs,
        ]);
        setTitle("");
        setContent("");
        setError("");
    };

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
            setBlogs(blogs.filter(b => b.id !== id));
        }
    };

    const handleEdit = (blog) => {
        setEditingId(blog.id);
        setEditTitle(blog.title);
        setEditContent(blog.content);
    };

    const handleEditSave = (id) => {
        setBlogs(blogs.map(b => b.id === id ? { ...b, title: editTitle, content: editContent } : b));
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
    };

    const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="manager-blog-page">
            <h2>Đăng bài Blog mới</h2>
            <form className="blog-form" onSubmit={handleSubmit}>
                <label>
                    Tiêu đề:
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề bài viết"
                    />
                </label>
                <label>
                    Nội dung:
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Nhập nội dung bài viết"
                        rows={6}
                    />
                </label>
                {error && <div className="error-message">{error}</div>}
                <button type="submit">Đăng bài</button>
            </form>
            <BlogPreview title={title} content={content} />
            <hr />
            <BlogStats blogs={blogs} />
            <BlogFilter filter={filter} setFilter={setFilter} />
            <h3>Danh sách bài Blog đã đăng</h3>
            <div className="blog-list">
                {filteredBlogs.length === 0 && <div>Không tìm thấy bài viết nào.</div>}
                {filteredBlogs.map((blog) => (
                    <div className="blog-item" key={blog.id}>
                        {editingId === blog.id ? (
                            <div className="blog-edit-form">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                />
                                <textarea
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    rows={4}
                                />
                                <button onClick={() => handleEditSave(blog.id)}>Lưu</button>
                                <button onClick={handleEditCancel}>Hủy</button>
                            </div>
                        ) : (
                            <>
                                <div className="blog-header">
                                    <h4>{blog.title}</h4>
                                    <span className="blog-date">{blog.date}</span>
                                </div>
                                <div className="blog-content">{blog.content}</div>
                                <div className="blog-actions">
                                    <button onClick={() => handleEdit(blog)}>Sửa</button>
                                    <button onClick={() => handleDelete(blog.id)}>Xóa</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 