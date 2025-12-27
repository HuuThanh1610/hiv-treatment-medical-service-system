import React from 'react';
import './ConfirmModal.scss';

const ConfirmModal = ({ show, message, onConfirm, onCancel }) => {
    if (!show) return null;
    return (
        <div className="modal-overlay confirm-modal-overlay">
            <div className="modal-content confirm-modal-content">
                <h3>Xác nhận</h3>
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button className="cancel-button" onClick={onCancel}>Hủy</button>
                    <button className="save-button" onClick={onConfirm}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal; 