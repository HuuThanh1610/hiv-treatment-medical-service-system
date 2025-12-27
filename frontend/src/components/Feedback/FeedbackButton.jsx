import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaStar, FaEdit, FaEye } from 'react-icons/fa';
import FeedbackService from '../../Services/FeedbackService';
import FeedbackForm from './FeedbackForm';
import FeedbackDisplay from './FeedbackDisplay';
import './FeedbackButton.scss';

// Global state để tránh multiple forms
let globalActiveForm = null;
let globalActiveOverlay = null;

const FeedbackButton = ({ appointmentId, appointmentStatus, userRole = 'PATIENT' }) => {
    const [showForm, setShowForm] = useState(false);
    const [showDisplay, setShowDisplay] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [canProvideFeedback, setCanProvideFeedback] = useState(false);
    const [loading, setLoading] = useState(true);

    // Unique identifier để tránh conflict
    const componentId = `feedback-${appointmentId}-${userRole}`;

    useEffect(() => {
        checkFeedbackStatus();

        // Cleanup function để tránh memory leaks
        return () => {
            setShowForm(false);
            setShowDisplay(false);
        };
    }, [appointmentId]);

    const checkFeedbackStatus = async () => {
        try {
            setLoading(true);
            
            // Kiểm tra xem đã có feedback chưa
            try {
                const existingFeedback = await FeedbackService.getFeedbackByAppointmentId(appointmentId);
                setFeedback(existingFeedback);
            } catch (error) {
                // Chưa có feedback
                setFeedback(null);
            }

            // Kiểm tra có thể tạo feedback không (chỉ cho PATIENT)
            if (userRole === 'PATIENT') {
                const canFeedback = await FeedbackService.canPatientProvideFeedback(appointmentId);
                setCanProvideFeedback(canFeedback);
            }
        } catch (error) {
            console.error('Error checking feedback status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSuccess = () => {
        setShowForm(false);
        setShowDisplay(false); // Đảm bảo đóng tất cả modal
        checkFeedbackStatus(); // Refresh feedback status
    };

    const handleEditFeedback = () => {
        // Đóng tất cả forms và overlays khác
        if (globalActiveForm && globalActiveForm !== componentId) {
            return; // Không cho phép mở form mới nếu đã có form khác
        }

        setShowDisplay(false);
        globalActiveForm = componentId;
        globalActiveOverlay = componentId;
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        globalActiveForm = null;
        globalActiveOverlay = null;
    };

    const handleCloseDisplay = () => {
        setShowDisplay(false);
        globalActiveOverlay = null;
    };

    const handleShowForm = () => {
        // Đóng tất cả forms và overlays khác
        if (globalActiveForm && globalActiveForm !== componentId) {
            return; // Không cho phép mở form mới nếu đã có form khác
        }

        // Đóng display modal nếu đang mở
        setShowDisplay(false);

        globalActiveForm = componentId;
        globalActiveOverlay = componentId;
        setShowForm(true);
    };

    if (loading) {
        return (
            <button className="feedback-button loading" disabled>
                <span className="loading-spinner"></span>
                Đang tải...
            </button>
        );
    }

    // Nếu đã có feedback
    if (feedback) {
        return (
            <>
                <button 
                    className="feedback-button view-feedback"
                    onClick={() => setShowDisplay(true)}
                >
                    <FaEye />
                    Xem đánh giá ({feedback.averageRating}/5)
                </button>

                {/* Modal hiển thị feedback - toàn màn hình */}
                {showDisplay && !showForm && createPortal(
                    <div
                        className="feedback-modal-overlay"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                handleCloseDisplay();
                            }
                        }}
                    >
                        <div className="feedback-modal">
                            <FeedbackDisplay
                                feedback={feedback}
                                canEdit={userRole === 'PATIENT'}
                                onEdit={handleEditFeedback}
                            />
                            <div className="modal-actions">
                                <button
                                    className="close-modal-button"
                                    onClick={handleCloseDisplay}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Form chỉnh sửa feedback - toàn màn hình */}
                {showForm && globalActiveForm === componentId && createPortal(
                    <FeedbackForm
                        key={`form-edit-${componentId}`}
                        appointmentId={appointmentId}
                        existingFeedback={feedback}
                        onClose={handleCloseForm}
                        onSuccess={handleFeedbackSuccess}
                    />,
                    document.body
                )}
            </>
        );
    }

    // Nếu chưa có feedback và có thể tạo feedback
    if (canProvideFeedback && userRole === 'PATIENT') {
        return (
            <>
                <button
                    className="feedback-button create-feedback"
                    onClick={handleShowForm}
                >
                    <FaStar />
                    Đánh giá dịch vụ
                </button>

                {/* Form tạo feedback mới - toàn màn hình */}
                {showForm && globalActiveForm === componentId && createPortal(
                    <FeedbackForm
                        key={`form-create-${componentId}`}
                        appointmentId={appointmentId}
                        onClose={handleCloseForm}
                        onSuccess={handleFeedbackSuccess}
                    />,
                    document.body
                )}
            </>
        );
    }

    // Không hiển thị gì nếu không thể feedback
    return null;
};

export default FeedbackButton;
