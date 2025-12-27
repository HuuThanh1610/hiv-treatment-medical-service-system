import React from 'react';
import './PaymentSuccessModal.scss';

const PaymentSuccessModal = ({ isOpen, onClose, paymentInfo }) => {
    if (!isOpen) return null;

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="payment-success-modal-overlay" onClick={onClose}>
            <div className="payment-success-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="success-icon">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="#10B981"/>
                            <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h2>Thanh toán thành công!</h2>
                    <p>Cảm ơn bạn đã hoàn tất thanh toán</p>
                </div>

                <div className="modal-body">
                    <div className="payment-details">
                        <h3>Thông tin thanh toán</h3>
                        
                        <div className="detail-row">
                            <span className="label">Mã giao dịch:</span>
                            <span className="value">{paymentInfo.transactionCode}</span>
                        </div>

                        <div className="detail-row">
                            <span className="label">Số tiền:</span>
                            <span className="value amount">{formatAmount(paymentInfo.amount)}</span>
                        </div>

                        <div className="detail-row">
                            <span className="label">Phương thức:</span>
                            <span className="value">{paymentInfo.method}</span>
                        </div>

                        <div className="detail-row">
                            <span className="label">Trạng thái:</span>
                            <span className="value status-paid">{paymentInfo.status}</span>
                        </div>

                        {paymentInfo.appointmentId && (
                            <div className="detail-row">
                                <span className="label">Mã lịch hẹn:</span>
                                <span className="value">#{paymentInfo.appointmentId}</span>
                            </div>
                        )}
                    </div>

                    <div className="next-steps">
                        <h4>Bước tiếp theo:</h4>
                        <ul>
                            <li>Kiểm tra email để nhận hóa đơn điện tử</li>
                            <li>Đến phòng khám đúng thời gian đã đặt</li>
                            <li>Mang theo giấy tờ tùy thân và thông tin thanh toán</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        className="btn-primary" 
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                    <button 
                        className="btn-secondary"
                        onClick={() => {
                            onClose();
                            // Navigate to appointments tab
                            const currentUrl = new URL(window.location);
                            currentUrl.searchParams.set('tab', 'appointments');
                            window.history.pushState({}, '', currentUrl);
                            window.location.reload();
                        }}
                    >
                        Xem lịch hẹn
                    </button>
                    <button 
                        className="btn-secondary"
                        onClick={() => {
                            onClose();
                            // Navigate to payments tab
                            const currentUrl = new URL(window.location);
                            currentUrl.searchParams.set('tab', 'user-payments');
                            window.history.pushState({}, '', currentUrl);
                            window.location.reload();
                        }}
                    >
                        Xem thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessModal;
