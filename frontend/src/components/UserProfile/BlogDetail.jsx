import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShare, faComment } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import '../DoctorProfile/DoctorBlog.scss';

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function BlogDetail() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [expandedComments, setExpandedComments] = useState({});
    const [localLikeStatus, setLocalLikeStatus] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(0);
    const [localCommentCount, setLocalCommentCount] = useState(0);
    const [showAllComments, setShowAllComments] = useState(false);
    const [displayedComments, setDisplayedComments] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [deletingComment, setDeletingComment] = useState(null);
    const [showDropdown, setShowDropdown] = useState(null);
    const [replies, setReplies] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        fetchBlog();
        // eslint-disable-next-line
    }, [id]);

    const fetchBlog = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`http://localhost:8080/api/blogs/${id}/detail`, { headers });

            setBlog(res.data);
            setLocalLikeStatus(res.data.isLikedByCurrentUser || false);
            setLocalLikeCount(res.data.likeCount || 0);
            setLocalCommentCount(res.data.commentCount || 0);

            // Set displayed comments (first 7)
            const comments = res.data.comments || [];
            setDisplayedComments(comments.slice(0, 7));

            // Lấy bài liên quan
            const publicRes = await axios.get('http://localhost:8080/api/blogs/public', { headers });
            const blogs = Array.isArray(publicRes.data) ? publicRes.data : [];
            setRelated(blogs.filter(b => String(b.id) !== String(id)).slice(0, 3));
        } catch (err) {
            console.error('Error fetching blog:', err);
            if (err.response?.status === 404) {
                console.log('Blog not found with ID:', id);
            }
            setBlog(null);
            setRelated([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!localStorage.getItem('token')) {
            alert('Vui lòng đăng nhập để thích bài viết');
            return;
        }

        setLikeLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            console.log('Current like status:', blog.isLikedByCurrentUser);
            console.log('Blog data:', blog);
            console.log('Blog ID:', blog.id);
            console.log('Like count:', blog.likeCount);
            console.log('Local like count:', localLikeCount);
            console.log('Local comment count:', localCommentCount);

            // Kiểm tra trạng thái like hiện tại
            const isCurrentlyLiked = localLikeStatus;
            console.log('Is currently liked:', isCurrentlyLiked);

            if (isCurrentlyLiked) {
                // Nếu đã like rồi thì unlike
                console.log('Attempting to unlike blog...');
                const response = await axios.delete(`http://localhost:8080/api/blogs/${id}/like`, { headers });
                console.log('Unlike response:', response.data);
                console.log('Đã bỏ like bài viết');

                // Cập nhật like count từ response
                if (response.data && response.data.likeCount !== undefined) {
                    console.log('=== UPDATE LIKE COUNT DEBUG (UNLIKE) ===');
                    console.log('Response data:', response.data);
                    console.log('New like count:', response.data.likeCount);
                    setLocalLikeCount(response.data.likeCount);
                    setBlog(prev => ({ ...prev, likeCount: response.data.likeCount }));
                }
            } else {
                // Nếu chưa like thì like
                console.log('Attempting to like blog...');
                const response = await axios.post(`http://localhost:8080/api/blogs/${id}/like`, {}, { headers });
                console.log('Like response:', response.data);
                console.log('Đã like bài viết');

                // Cập nhật like count từ response
                if (response.data && response.data.likeCount !== undefined) {
                    console.log('=== UPDATE LIKE COUNT DEBUG (LIKE) ===');
                    console.log('Response data:', response.data);
                    console.log('New like count:', response.data.likeCount);
                    setLocalLikeCount(response.data.likeCount);
                    setBlog(prev => ({ ...prev, likeCount: response.data.likeCount }));
                }
            }

            // Cập nhật trạng thái local sau khi API call thành công
            setLocalLikeStatus(!isCurrentlyLiked);
        } catch (err) {
            console.error('Error liking blog:', err);
            console.error('Error details:', err.response?.data);
            if (err.response?.status === 500) {
                console.log('Server error, but continuing...');
            } else {
                alert('Có lỗi xảy ra khi thao tác like/unlike');
            }
        } finally {
            setLikeLoading(false);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        if (!localStorage.getItem('token')) {
            toast.error('Vui lòng đăng nhập để bình luận');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8'
            };

            // Gửi content trực tiếp không cần encode
            const response = await axios.post(`http://localhost:8080/api/blogs/${id}/comments`, commentText, { headers });
            setCommentText('');

            // Cập nhật comment count và comments từ response
            if (response.data) {
                console.log('=== UPDATE COMMENT COUNT DEBUG ===');
                console.log('Response data:', response.data);
                console.log('Current local comment count:', localCommentCount);
                const newCommentCount = localCommentCount + 1;
                console.log('New comment count:', newCommentCount);
                setLocalCommentCount(newCommentCount);

                const newComments = [response.data, ...(blog.comments || [])];
                setBlog(prev => ({
                    ...prev,
                    commentCount: (prev.commentCount || 0) + 1,
                    comments: newComments
                }));

                // Cập nhật displayed comments
                updateDisplayedComments(newComments);

                toast.success('Bình luận đã được đăng thành công!');
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            if (err.response?.status === 500) {
                toast.error('Lỗi server: Có thể database chưa có bảng blog_comments. Vui lòng chạy migration hoặc tạo bảng thủ công.');
            } else {
                toast.error('Có lỗi xảy ra khi thêm comment');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        const text = blog?.title || 'Bài viết hay';

        if (navigator.share) {
            navigator.share({
                title: blog?.title,
                text: text,
                url: url
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
                alert('Đã sao chép link vào clipboard!');
            });
        }
    };

    const toggleCommentExpansion = (commentId) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const handleShowMoreComments = () => {
        setShowAllComments(true);
        setDisplayedComments(blog.comments || []);
    };

    const handleShowLessComments = () => {
        setShowAllComments(false);
        setDisplayedComments((blog.comments || []).slice(0, 7));
    };

    // Edit comment
    const handleEditComment = async (commentId) => {
        if (!editCommentText.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8'
            };

            const response = await axios.put(
                `http://localhost:8080/api/blogs/comments/${commentId}`,
                editCommentText,
                { headers }
            );

            // Cập nhật comment trong danh sách
            const updatedComments = blog.comments.map(comment =>
                comment.id === commentId
                    ? { ...comment, content: editCommentText, updatedAt: new Date().toISOString() }
                    : comment
            );

            setBlog(prev => ({ ...prev, comments: updatedComments }));
            updateDisplayedComments(updatedComments);

            setEditingComment(null);
            setEditCommentText('');

            toast.success('Bình luận đã được cập nhật thành công!');
        } catch (err) {
            console.error('Error editing comment:', err);
            toast.error('Có lỗi xảy ra khi sửa bình luận');
        } finally {
            setSubmitting(false);
        }
    };

    // Show confirm modal for delete
    const showDeleteConfirm = (commentId) => {
        if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
            handleDeleteComment(commentId);
        }
    };

    // Delete comment
    const handleDeleteComment = async (commentId) => {
        setDeletingComment(commentId);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            await axios.delete(`http://localhost:8080/api/blogs/comments/${commentId}`, { headers });

            // Cập nhật comment count và danh sách comment
            const updatedComments = blog.comments.filter(comment => comment.id !== commentId);
            const newCommentCount = localCommentCount - 1;

            setLocalCommentCount(newCommentCount);
            setBlog(prev => ({
                ...prev,
                comments: updatedComments,
                commentCount: newCommentCount
            }));
            updateDisplayedComments(updatedComments);

            toast.success('Bình luận đã được xóa thành công!');
        } catch (err) {
            console.error('Error deleting comment:', err);
            toast.error('Có lỗi xảy ra khi xóa bình luận');
        } finally {
            setDeletingComment(null);
        }
    };

    // Reply to comment
    const handleReplyComment = async (commentId) => {
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8'
            };

            const response = await axios.post(
                `http://localhost:8080/api/blogs/${id}/comments`,
                replyText,
                { headers }
            );

            // Thêm reply vào danh sách replies của comment gốc
            const newReply = response.data;
            setReplies(prev => ({
                ...prev,
                [commentId]: [...(prev[commentId] || []), newReply]
            }));

            // Cập nhật comment count
            const newCommentCount = localCommentCount + 1;
            setLocalCommentCount(newCommentCount);
            setBlog(prev => ({
                ...prev,
                commentCount: newCommentCount
            }));

            setReplyingTo(null);
            setReplyText('');

            toast.success('Trả lời đã được đăng thành công!');
        } catch (err) {
            console.error('Error replying to comment:', err);
            toast.error('Có lỗi xảy ra khi trả lời bình luận');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper function to update displayed comments
    const updateDisplayedComments = (comments) => {
        if (showAllComments) {
            setDisplayedComments(comments);
        } else {
            setDisplayedComments(comments.slice(0, 7));
        }
    };

    // Check if current user can edit/delete comment
    const canEditComment = (comment) => {
        const currentUser = localStorage.getItem('email');
        return comment.userEmail === currentUser;
    };

    // Handle dropdown menu
    const toggleDropdown = (commentId) => {
        setShowDropdown(showDropdown === commentId ? null : commentId);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.dropdown-container')) {
                setShowDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const renderCommentContent = (content, commentId) => {
        const isLong = content.length > 150;
        const isExpanded = expandedComments[commentId];

        if (!isLong) {
            return <div className="comment-content" style={{ fontSize: 14, color: '#555', textAlign: 'left' }}>{content}</div>;
        }

        return (
            <div className="comment-content" style={{ fontSize: 14, color: '#555', textAlign: 'left' }}>
                {isExpanded ? (
                    <>
                        {content}
                        <button
                            onClick={() => toggleCommentExpansion(commentId)}
                            className="comment-expand-btn"
                        >
                            Thu gọn
                        </button>
                    </>
                ) : (
                    <>
                        {content.slice(0, 150)}...
                        <button
                            onClick={() => toggleCommentExpansion(commentId)}
                            className="comment-expand-btn"
                        >
                            Xem thêm
                        </button>
                    </>
                )}
            </div>
        );
    };

    if (loading) return <div className="loading-overlay"><div className="loading-spinner"></div></div>;
    if (!blog) return <div style={{ marginTop: 120, textAlign: 'center', color: '#888' }}>Không tìm thấy bài viết.</div>;

    // Caption demo: lấy dòng đầu tiên có (Nguồn: ...)
    let caption = '';
    if (blog.content && blog.content.includes('(Nguồn:')) {
        const match = blog.content.match(/\((Nguồn:[^)]+)\)/);
        if (match) caption = match[1];
    }

    return (
        <div style={{ marginTop: '90px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto', display: 'flex', gap: 40, alignItems: 'flex-start' }}>
            <div style={{ flex: 2, minWidth: 0 }}>
                <button
                    className="cancel-button"
                    style={{
                        marginBottom: 32,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#666',
                        padding: '8px 0'
                    }}
                    onClick={() => navigate(-1)}
                >
                    <span style={{ fontSize: '18px' }}>←</span>
                    Quay lại
                </button>
                <h1 style={{ fontSize: '2.3rem', fontWeight: 700, marginBottom: 18, color: '#1a237e', lineHeight: 1.2, textAlign: 'left' }}>{blog.title}</h1>
                <div style={{ marginBottom: 18, color: '#888', fontSize: 15, textAlign: 'left' }}>
                    Ngày đăng: {formatDate(blog.createdAt)}
                    {blog.doctorName && <span> &nbsp;|&nbsp; Bác sĩ: {blog.doctorName}</span>}
                </div>
                {blog.imageUrl && (
                    <div style={{ marginBottom: 12 }}>
                        <img src={blog.imageUrl} alt="blog" style={{ maxWidth: '100%', borderRadius: 10, display: 'block', margin: '0 auto' }} />
                        {caption && <div style={{ fontStyle: 'italic', color: '#888', fontSize: 15, marginTop: 6, textAlign: 'left' }}>{caption}</div>}
                    </div>
                )}
                <div style={{ fontSize: '1.18rem', color: '#222', lineHeight: 1.8, textAlign: 'left', marginTop: 18, marginBottom: 32, letterSpacing: 0.1 }}>
                    {blog.content.split('\n').map((para, idx) =>
                        <p key={idx} style={{ margin: '0 0 1.2em 0' }}>{para}</p>
                    )}
                </div>

                {/* Interaction Section */}
                <div style={{ borderTop: '1px solid #eee', paddingTop: 24, marginTop: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                        <button
                            onClick={handleLike}
                            disabled={likeLoading}
                            className={`like-button ${localLikeStatus ? 'liked' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 16px',
                                border: localLikeStatus ? '1px solid #e91e63' : '1px solid #ddd',
                                borderRadius: 20,
                                background: localLikeStatus ? '#fce4ec' : '#fff',
                                color: localLikeStatus ? '#e91e63' : '#666',
                                cursor: likeLoading ? 'not-allowed' : 'pointer',
                                fontSize: 14,
                                transition: 'all 0.3s ease',
                                transform: localLikeStatus ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: localLikeStatus ? '0 2px 8px rgba(233, 30, 99, 0.3)' : 'none',
                                opacity: likeLoading ? 0.7 : 1
                            }}
                            title={`Like status: ${localLikeStatus ? 'Liked' : 'Not liked'}`}
                        >
                            <FontAwesomeIcon
                                icon={faHeart}
                                style={{
                                    fontSize: 14,
                                    color: localLikeStatus ? '#e91e63' : '#666',
                                    transition: 'all 0.3s ease',
                                    animation: likeLoading ? 'pulse 1s infinite' : 'none'
                                }}
                            />
                            {likeLoading ? 'Đang xử lý...' : `${localLikeCount} Thích`}
                            {/* Debug info */}
                            {process.env.NODE_ENV === 'development' && (
                                <span style={{ fontSize: 10, color: '#999', marginLeft: 8 }}>

                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleShare}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 16px',
                                border: '1px solid #ddd',
                                borderRadius: 20,
                                background: '#fff',
                                color: '#666',
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                        >
                            <FontAwesomeIcon icon={faShare} style={{ fontSize: 14 }} />
                            Chia sẻ
                        </button>
                    </div>

                    {/* Comments Section */}
                    <div style={{ marginTop: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#333' }}>
                            Bình luận ({localCommentCount})
                            {/* Debug info */}
                            {process.env.NODE_ENV === 'development' && (
                                <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>

                                </span>
                            )}
                        </h3>

                        {/* Add Comment */}
                        <div style={{ marginBottom: 24 }}>
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Viết bình luận của bạn..."
                                maxLength={2000}
                                style={{
                                    width: '100%',
                                    minHeight: 80,
                                    padding: 12,
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    lineHeight: 1.5
                                }}
                            />
                            <div style={{
                                fontSize: 12,
                                color: '#888',
                                textAlign: 'right',
                                marginTop: 4
                            }}>
                                {commentText.length}/2000 ký tự
                            </div>
                            <button
                                onClick={handleComment}
                                disabled={submitting || !commentText.trim()}
                                style={{
                                    marginTop: 8,
                                    padding: '8px 16px',
                                    background: commentText.trim() ? '#1976d2' : '#ccc',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                                    fontSize: 14
                                }}
                            >
                                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                            </button>
                        </div>

                        {/* Comments List */}
                        <div>
                            {displayedComments && displayedComments.length > 0 ? (
                                <>
                                    {displayedComments.map(comment => (
                                        <div key={comment.id} style={{
                                            padding: 16,
                                            border: '1px solid #eee',
                                            borderRadius: 8,
                                            marginBottom: 12,
                                            background: '#fafafa',
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                            textAlign: 'left'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                                                <div>
                                                    <strong style={{ fontSize: 14, color: '#333' }}>{comment.userName}</strong>
                                                    {comment.updatedAt && (
                                                        <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>
                                                            (đã chỉnh sửa)
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: 12, color: '#888' }}>{formatDate(comment.createdAt)}</span>
                                                    <div className="dropdown-container" style={{ position: 'relative' }}>
                                                        <button
                                                            onClick={() => toggleDropdown(comment.id)}
                                                            style={{
                                                                background: '#1976d2',
                                                                border: 'none',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                fontSize: 14,
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.background = '#1565c0'}
                                                            onMouseLeave={(e) => e.target.style.background = '#1976d2'}
                                                            title="Tùy chọn"
                                                        >
                                                            ⋯
                                                        </button>

                                                        {showDropdown === comment.id && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                right: 0,
                                                                top: '100%',
                                                                background: 'white',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '6px',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                                zIndex: 1000,
                                                                minWidth: '120px',
                                                                fontSize: '12px'
                                                            }}>
                                                                {(() => {
                                                                    const canEdit = canEditComment(comment);
                                                                    console.log('=== DROPDOWN DEBUG ===');
                                                                    console.log('Comment ID:', comment.id);
                                                                    console.log('Can edit comment:', canEdit);
                                                                    return canEdit;
                                                                })() ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingComment(comment.id);
                                                                                setEditCommentText(comment.content);
                                                                                setShowDropdown(null);
                                                                            }}
                                                                            style={{
                                                                                width: '100%',
                                                                                padding: '8px 12px',
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                textAlign: 'left',
                                                                                cursor: 'pointer',
                                                                                color: '#ff9800',
                                                                                fontSize: '12px',
                                                                                borderBottom: '1px solid #eee'
                                                                            }}
                                                                            onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                                                            onMouseLeave={(e) => e.target.style.background = 'none'}
                                                                        >
                                                                            ✏️ Sửa
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                showDeleteConfirm(comment.id);
                                                                                setShowDropdown(null);
                                                                            }}
                                                                            disabled={deletingComment === comment.id}
                                                                            style={{
                                                                                width: '100%',
                                                                                padding: '8px 12px',
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                textAlign: 'left',
                                                                                cursor: deletingComment === comment.id ? 'not-allowed' : 'pointer',
                                                                                color: '#f44336',
                                                                                fontSize: '12px'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                if (deletingComment !== comment.id) {
                                                                                    e.target.style.background = '#f5f5f5';
                                                                                }
                                                                            }}
                                                                            onMouseLeave={(e) => e.target.style.background = 'none'}
                                                                        >
                                                                            {deletingComment === comment.id ? '🗑️ Đang xóa...' : '🗑️ Xóa'}
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <div style={{
                                                                        padding: '8px 12px',
                                                                        color: '#999',
                                                                        fontSize: '12px',
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        Chỉ chủ comment mới có thể sửa/xóa
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit mode */}
                                            {editingComment === comment.id ? (
                                                <div style={{ marginBottom: 12 }}>
                                                    <textarea
                                                        value={editCommentText}
                                                        onChange={(e) => setEditCommentText(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            minHeight: 60,
                                                            padding: 8,
                                                            border: '1px solid #ddd',
                                                            borderRadius: 4,
                                                            fontSize: 14,
                                                            resize: 'vertical'
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                        <button
                                                            onClick={() => handleEditComment(comment.id)}
                                                            disabled={submitting}
                                                            style={{
                                                                padding: '4px 12px',
                                                                background: '#1976d2',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: 4,
                                                                cursor: submitting ? 'not-allowed' : 'pointer',
                                                                fontSize: 12
                                                            }}
                                                        >
                                                            {submitting ? 'Đang lưu...' : 'Lưu'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingComment(null);
                                                                setEditCommentText('');
                                                            }}
                                                            style={{
                                                                padding: '4px 12px',
                                                                background: '#666',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: 4,
                                                                cursor: 'pointer',
                                                                fontSize: 12
                                                            }}
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {renderCommentContent(comment.content, comment.id)}

                                                    {/* Comment actions */}
                                                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
                                                        <button
                                                            onClick={() => setReplyingTo(comment.id)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#1976d2',
                                                                cursor: 'pointer',
                                                                fontSize: 12,
                                                                textDecoration: 'underline'
                                                            }}
                                                        >
                                                            Trả lời
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {/* Reply form */}
                                            {replyingTo === comment.id && (
                                                <div style={{
                                                    marginTop: 12,
                                                    padding: 12,
                                                    background: '#f0f8ff',
                                                    borderRadius: 6,
                                                    border: '1px solid #e3f2fd'
                                                }}>
                                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                                                        Trả lời cho {comment.userName}:
                                                    </div>
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Viết trả lời của bạn..."
                                                        style={{
                                                            width: '100%',
                                                            minHeight: 60,
                                                            padding: 8,
                                                            border: '1px solid #ddd',
                                                            borderRadius: 4,
                                                            fontSize: 14,
                                                            resize: 'vertical'
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                        <button
                                                            onClick={() => handleReplyComment(comment.id)}
                                                            disabled={submitting}
                                                            style={{
                                                                padding: '4px 12px',
                                                                background: '#1976d2',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: 4,
                                                                cursor: submitting ? 'not-allowed' : 'pointer',
                                                                fontSize: 12
                                                            }}
                                                        >
                                                            {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setReplyingTo(null);
                                                                setReplyText('');
                                                            }}
                                                            style={{
                                                                padding: '4px 12px',
                                                                background: '#666',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: 4,
                                                                cursor: 'pointer',
                                                                fontSize: 12
                                                            }}
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Display replies */}
                                            {replies[comment.id] && replies[comment.id].length > 0 && (
                                                <div style={{
                                                    marginTop: 12,
                                                    paddingLeft: 20,
                                                    borderLeft: '2px solid #e0e0e0'
                                                }}>
                                                    {replies[comment.id].map((reply, index) => (
                                                        <div key={reply.id || index} style={{
                                                            marginBottom: 12,
                                                            padding: 12,
                                                            background: '#f9f9f9',
                                                            borderRadius: 6,
                                                            border: '1px solid #e0e0e0'
                                                        }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                marginBottom: 8
                                                            }}>
                                                                <div style={{ fontWeight: 600, fontSize: 13, color: '#1976d2' }}>
                                                                    {reply.userName}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: '#888' }}>
                                                                    {formatDate(reply.createdAt)}
                                                                </div>
                                                            </div>
                                                            <div style={{
                                                                fontSize: 14,
                                                                color: '#333',
                                                                lineHeight: 1.4,
                                                                wordBreak: 'break-word'
                                                            }}>
                                                                {reply.content}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Show More/Less Button */}
                                    {blog.comments && blog.comments.length > 7 && (
                                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                                            {!showAllComments ? (
                                                <button
                                                    onClick={handleShowMoreComments}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: '#1976d2',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        cursor: 'pointer',
                                                        fontSize: 14
                                                    }}
                                                >
                                                    Xem thêm ({blog.comments.length - 7} bình luận)
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleShowLessComments}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: '#666',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        cursor: 'pointer',
                                                        fontSize: 14
                                                    }}
                                                >
                                                    Thu gọn
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>
                                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <aside style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18, color: '#1a237e' }}>Bài viết liên quan</div>
                {related.length === 0 && <div style={{ color: '#888' }}>Không có bài viết liên quan.</div>}
                {related.map(r => (
                    <div key={r.id} style={{ marginBottom: 24, cursor: 'pointer' }} onClick={() => navigate(`/user/blog/${r.id}`)}>
                        {r.imageUrl && <img src={r.imageUrl} alt={r.title} style={{ width: '100%', borderRadius: 8, marginBottom: 8, objectFit: 'cover', maxHeight: 90 }} />}
                        <div style={{ fontWeight: 600, color: '#222', fontSize: 15, marginBottom: 4 }}>{r.title}</div>
                        <div style={{ color: '#888', fontSize: 13 }}>{formatDate(r.createdAt)}</div>
                    </div>
                ))}
            </aside>
        </div>


    );
} 