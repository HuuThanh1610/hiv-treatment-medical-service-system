import React from 'react';
import { FaCheck, FaTimes, FaEnvelope, FaCalendarCheck } from 'react-icons/fa';
import './SuccessModal.scss';

const SuccessModal = ({ isOpen, onClose, title, message, type = 'default' }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'email':
                return <FaEnvelope />;
            case 'appointment':
                return <FaCalendarCheck />;
            default:
                return <FaCheck />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'email':
                return title || 'Email đã được gửi!';
            case 'appointment':
                return title || 'Thành công!';
            default:
                return title || 'Thành công!';
        }
    };

    return (
        <div className="success-modal-overlay" onClick={onClose}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                <button className="success-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>
                
                <div className="success-modal-content">
                    <div className="success-modal-icon">
                        {getIcon()}
                    </div>
                    
                    <h3 className="success-modal-title">
                        {getTitle()}
                    </h3>
                    
                    <p className="success-modal-message">
                        {message}
                    </p>
                    
                    <div className="success-modal-actions">
                        <button 
                            className="success-modal-btn"
                            onClick={onClose}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
