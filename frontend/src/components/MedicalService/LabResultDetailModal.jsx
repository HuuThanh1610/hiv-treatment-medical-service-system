import React, { useEffect } from 'react';
import { FaTimes, FaExclamationTriangle, FaArrowUp, FaInfoCircle } from 'react-icons/fa';
import './LabResultDetailModal.scss';

const LabResultDetailModal = ({ show, onClose, result }) => {
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        // Cleanup function để khôi phục cuộn khi component unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]); // Chạy lại effect khi prop 'show' thay đổi

    if (!show || !result) {
        return null;
    }

    const isWarning = result.status === 'Cần chú ý';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '1000px',
                    height: '750px',
                    maxWidth: '90vw',
                    maxHeight: '90vh'
                }}
            >
                <header className="modal-header">
                    <div>
                        <h3>{result.name}</h3>
                        <p>Kết quả xét nghiệm ngày {result.date}</p>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </header>

                <section className="modal-body">
                    <div className="result-summary">
                        <div>
                            <p>Kết quả</p>
                            <h4>{result.value}</h4>
                        </div>
                        {isWarning && <span className="status-tag attention"><FaExclamationTriangle /> {result.status}</span>}
                    </div>

                    <div className="result-details-grid">
                        <div className="detail-item">
                            <strong>Thông tin xét nghiệm</strong>
                            <p>Ngày xét nghiệm: {result.date}</p>
                            <p>Bác sĩ: {result.doctor}</p>
                            <p>Khoảng tham chiếu: {result.referenceRange}</p>
                            <p>Đơn vị: {result.unit}</p>
                            <p>Xu hướng: <FaArrowUp /> {result.trend}</p>
                        </div>
                        <div className="detail-item">
                            <strong>Ghi chú & Khuyến nghị</strong>
                            <p><strong>Ghi chú:</strong> {result.notes}</p>
                            <p><strong>Khuyến nghị:</strong> {result.recommendations}</p>
                        </div>
                    </div>

                    <div className="history-section">
                        <h4>Lịch sử kết quả</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th>Kết quả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.history.map((record, index) => (
                                    <tr key={index}>
                                        <td>{record.date}</td>
                                        <td>{record.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="important-info">
                        <FaInfoCircle />
                        <p>Thông tin quả xét nghiệm này chỉ mang tính chất tham khảo. Vui lòng tham khảo ý kiến bác sĩ để được tư vấn chính xác về tình trạng sức khỏe của bạn.</p>
                    </div>
                </section>

                <footer className="modal-footer">
                    <button className="btn-secondary">Tư vấn với bác sĩ</button>
                    <button className="btn-primary">Đặt lịch khám</button>
                    <button className="btn-tertiary" onClick={onClose}>Đóng</button>
                </footer>
            </div>
        </div>
    );
};

export default LabResultDetailModal; 