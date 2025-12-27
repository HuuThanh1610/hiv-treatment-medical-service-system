import React from 'react';
import { createPortal } from 'react-dom';
import { FaStar, FaRegStar, FaEdit, FaCalendarAlt, FaUser } from 'react-icons/fa';
import './FeedbackDisplay.scss';

const FeedbackDisplay = ({ feedback, onEdit, canEdit = false }) => {
    const renderStars = (rating) => {
        return (
            <div className="star-display">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
                        {star <= rating ? <FaStar /> : <FaRegStar />}
                    </span>
                ))}
                <span className="rating-number">({rating}/5)</span>
            </div>
        );
    };

    const getRatingColor = (rating) => {
        if (rating >= 4) return '#10b981'; // Green
        if (rating >= 3) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!feedback) {
        return (
            <div className="no-feedback">
                <div className="no-feedback-icon">⭐</div>
                <p>Chưa có đánh giá cho lịch hẹn này</p>
            </div>
        );
    }

    return (
        <div className="feedback-display">
            <div className="feedback-header">
                <div className="feedback-title">
                    <h3>⭐ Đánh giá dịch vụ</h3>
                    <div className="average-rating" style={{ color: getRatingColor(feedback.averageRating) }}>
                        <span className="average-number">{feedback.averageRating}</span>
                        <span className="average-text">/5.0</span>
                    </div>
                </div>
                {canEdit && (
                    <button className="edit-button" onClick={onEdit}>
                        <FaEdit />
                        Chỉnh sửa
                    </button>
                )}
            </div>

            <div className="feedback-meta">
                {feedback.patientName && (
                    <div className="meta-item">
                        <FaUser />
                        <span>Bệnh nhân: {feedback.patientName}</span>
                    </div>
                )}
                {feedback.createdAt && (
                    <div className="meta-item">
                        <FaCalendarAlt />
                        <span>Đánh giá lúc: {formatDate(feedback.createdAt)}</span>
                    </div>
                )}
            </div>

            <div className="rating-details">
                <div className="rating-item">
                    <div className="rating-label">
                        <span className="icon">👥</span>
                        <span>Thái độ nhân viên</span>
                    </div>
                    {renderStars(feedback.staffRating)}
                </div>

                <div className="rating-item">
                    <div className="rating-label">
                        <span className="icon">⏰</span>
                        <span>Thời gian chờ</span>
                    </div>
                    {renderStars(feedback.waitingTimeRating)}
                </div>

                <div className="rating-item">
                    <div className="rating-label">
                        <span className="icon">🏥</span>
                        <span>Cơ sở vật chất</span>
                    </div>
                    {renderStars(feedback.facilityRating)}
                </div>

                <div className="rating-item">
                    <div className="rating-label">
                        <span className="icon">👨‍⚕️</span>
                        <span>Chất lượng khám</span>
                    </div>
                    {renderStars(feedback.doctorRating)}
                </div>
            </div>

            {feedback.additionalComments && (
                <div className="comments-section">
                    <h4>💬 Góp ý thêm</h4>
                    <div className="comments-content">
                        {feedback.additionalComments}
                    </div>
                </div>
            )}

            {feedback.updatedAt && feedback.updatedAt !== feedback.createdAt && (
                <div className="updated-info">
                    <small>Cập nhật lần cuối: {formatDate(feedback.updatedAt)}</small>
                </div>
            )}
        </div>
    );
};

export default FeedbackDisplay;
