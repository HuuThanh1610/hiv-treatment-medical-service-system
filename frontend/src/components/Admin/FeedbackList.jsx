import React, { useState, useEffect } from 'react';
import { FaStar, FaSearch, FaFilter, FaEye, FaCalendarAlt, FaUser } from 'react-icons/fa';
import FeedbackService from '../../Services/FeedbackService';
import FeedbackDisplay from '../Feedback/FeedbackDisplay';
import './FeedbackList.scss';

const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    useEffect(() => {
        filterFeedbacks();
    }, [feedbacks, searchTerm, ratingFilter]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const data = await FeedbackService.getAllFeedbacks();
            setFeedbacks(data);
        } catch (error) {
            setError('Không thể tải danh sách đánh giá');
            console.error('Error fetching feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterFeedbacks = () => {
        let filtered = [...feedbacks];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(feedback =>
                feedback.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                feedback.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                feedback.additionalComments?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by rating
        if (ratingFilter !== 'all') {
            const minRating = parseInt(ratingFilter);
            filtered = filtered.filter(feedback => 
                Math.floor(feedback.averageRating) === minRating
            );
        }

        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFilteredFeedbacks(filtered);
    };

    const handleViewDetail = (feedback) => {
        setSelectedFeedback(feedback);
        setShowDetail(true);
    };

    const renderStars = (rating) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                    <FaStar 
                        key={star} 
                        className={star <= rating ? 'filled' : 'empty'} 
                    />
                ))}
            </div>
        );
    };

    const getRatingColor = (rating) => {
        if (rating >= 4) return '#10b981';
        if (rating >= 3) return '#f59e0b';
        return '#ef4444';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="feedback-list-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách đánh giá...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feedback-list-error">
                <p>{error}</p>
                <button onClick={fetchFeedbacks}>Thử lại</button>
            </div>
        );
    }

    return (
        <div className="feedback-list-container">
            <div className="feedback-list-header">
                <h2>📋 Quản lý đánh giá dịch vụ</h2>
                <div className="stats-summary">
                    <div className="stat-item">
                        <span className="stat-number">{feedbacks.length}</span>
                        <span className="stat-label">Tổng đánh giá</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {feedbacks.length > 0 
                                ? (feedbacks.reduce((sum, f) => sum + f.averageRating, 0) / feedbacks.length).toFixed(1)
                                : '0.0'
                            }
                        </span>
                        <span className="stat-label">Điểm trung bình</span>
                    </div>
                </div>
            </div>

            <div className="feedback-list-filters">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ hoặc góp ý..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="rating-filter">
                    <FaFilter className="filter-icon" />
                    <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                    >
                        <option value="all">Tất cả đánh giá</option>
                        <option value="5">5 sao</option>
                        <option value="4">4 sao</option>
                        <option value="3">3 sao</option>
                        <option value="2">2 sao</option>
                        <option value="1">1 sao</option>
                    </select>
                </div>
            </div>

            <div className="feedback-list">
                {filteredFeedbacks.length === 0 ? (
                    <div className="no-feedbacks">
                        <div className="no-feedbacks-icon">⭐</div>
                        <p>Không tìm thấy đánh giá nào</p>
                    </div>
                ) : (
                    filteredFeedbacks.map(feedback => (
                        <div key={feedback.id} className="feedback-item">
                            <div className="feedback-item-header">
                                <div className="patient-info">
                                    <FaUser className="user-icon" />
                                    <span className="patient-name">{feedback.patientName || 'Ẩn danh'}</span>
                                </div>
                                <div className="rating-display" style={{ color: getRatingColor(feedback.averageRating) }}>
                                    {renderStars(Math.round(feedback.averageRating))}
                                    <span className="rating-number">{feedback.averageRating}/5</span>
                                </div>
                            </div>

                            <div className="feedback-item-content">
                                <div className="feedback-meta">
                                    <span className="doctor-name">👨‍⚕️ BS. {feedback.doctorName}</span>
                                    <span className="feedback-date">
                                        <FaCalendarAlt />
                                        {formatDate(feedback.createdAt)}
                                    </span>
                                </div>

                                {feedback.additionalComments && (
                                    <div className="feedback-comment">
                                        "{feedback.additionalComments.substring(0, 100)}
                                        {feedback.additionalComments.length > 100 ? '...' : ''}"
                                    </div>
                                )}

                                <div className="rating-breakdown">
                                    <div className="rating-item">
                                        <span>Nhân viên: {feedback.staffRating}/5</span>
                                    </div>
                                    <div className="rating-item">
                                        <span>Thời gian: {feedback.waitingTimeRating}/5</span>
                                    </div>
                                    <div className="rating-item">
                                        <span>Cơ sở: {feedback.facilityRating}/5</span>
                                    </div>
                                    <div className="rating-item">
                                        <span>Bác sĩ: {feedback.doctorRating}/5</span>
                                    </div>
                                </div>
                            </div>

                            <div className="feedback-item-actions">
                                <button 
                                    className="view-detail-button"
                                    onClick={() => handleViewDetail(feedback)}
                                >
                                    <FaEye />
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showDetail && selectedFeedback && (
                <div className="feedback-detail-modal">
                    <div className="modal-content">
                        <FeedbackDisplay 
                            feedback={selectedFeedback}
                            canEdit={false}
                        />
                        <div className="modal-actions">
                            <button 
                                className="close-button"
                                onClick={() => setShowDetail(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackList;
