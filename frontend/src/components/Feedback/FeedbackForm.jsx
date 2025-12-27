import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaStar, FaRegStar, FaTimes, FaCheck } from 'react-icons/fa';
import FeedbackService from '../../Services/FeedbackService';
import './FeedbackForm.scss';

const FeedbackForm = ({ appointmentId, existingFeedback, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        appointmentId: appointmentId,
        staffRating: 0,
        waitingTimeRating: 0,
        facilityRating: 0,
        doctorRating: 0,
        additionalComments: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (existingFeedback) {
            setFormData({
                appointmentId: existingFeedback.appointmentId,
                staffRating: existingFeedback.staffRating || 0,
                waitingTimeRating: existingFeedback.waitingTimeRating || 0,
                facilityRating: existingFeedback.facilityRating || 0,
                doctorRating: existingFeedback.doctorRating || 0,
                additionalComments: existingFeedback.additionalComments || ''
            });
        }
    }, [existingFeedback]);

    const handleRatingChange = (category, rating) => {
        setFormData(prev => ({
            ...prev,
            [category]: rating
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (loading || isSubmitted) {
            return;
        }

        // Validation
        if (formData.staffRating === 0 || formData.waitingTimeRating === 0 ||
            formData.facilityRating === 0 || formData.doctorRating === 0) {
            setError('Vui lòng đánh giá tất cả các mục (1-5 sao)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (existingFeedback) {
                await FeedbackService.updateFeedback(existingFeedback.id, formData);
            } else {
                await FeedbackService.createFeedback(formData);
            }

            setIsSubmitted(true);
            onSuccess && onSuccess();

            // Delay close để tránh flicker
            setTimeout(() => {
                onClose && onClose();
            }, 100);
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const renderStarRating = (category, currentRating, label) => {
        return (
            <div className="rating-section">
                <label className="rating-label">{label}</label>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            className={`star-button ${star <= currentRating ? 'active' : ''}`}
                            onClick={() => handleRatingChange(category, star)}
                        >
                            {star <= currentRating ? <FaStar /> : <FaRegStar />}
                        </button>
                    ))}
                    <span className="rating-text">
                        {currentRating > 0 ? `${currentRating}/5` : 'Chưa đánh giá'}
                    </span>
                </div>
            </div>
        );
    };

    const formContent = (
        <div
            className="feedback-form-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose && onClose();
                }
            }}
        >
            <div className="feedback-form-container">
                <div className="feedback-form-header">
                    <h3>
                        {existingFeedback ? '✏️ Chỉnh sửa đánh giá' : '⭐ Đánh giá dịch vụ'}
                    </h3>
                    <button className="close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="feedback-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="rating-sections">
                        {renderStarRating('staffRating', formData.staffRating, '👥 Thái độ nhân viên tiếp đón')}
                        {renderStarRating('waitingTimeRating', formData.waitingTimeRating, '⏰ Thời gian chờ khám')}
                        {renderStarRating('facilityRating', formData.facilityRating, '🏥 Cơ sở vật chất, vệ sinh')}
                        {renderStarRating('doctorRating', formData.doctorRating, '👨‍⚕️ Chất lượng khám bệnh')}
                    </div>

                    <div className="comments-section">
                        <label className="comments-label">💬 Góp ý thêm (tùy chọn)</label>
                        <textarea
                            value={formData.additionalComments}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                additionalComments: e.target.value
                            }))}
                            placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                            maxLength={500}
                            rows={4}
                        />
                        <div className="char-count">
                            {formData.additionalComments.length}/500 ký tự
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-button" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <span>Đang gửi...</span>
                            ) : (
                                <>
                                    <FaCheck />
                                    {existingFeedback ? 'Cập nhật' : 'Gửi đánh giá'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Render form using Portal to ensure it's always at document root
    return createPortal(formContent, document.body);
};

export default FeedbackForm;
