
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LabResultsTable.scss';
import LabResultForm from './LabResultForm';
import { toast } from 'react-toastify';
import { FaEye, FaPlus, FaTimes } from 'react-icons/fa';

const LabResultsTable = () => {

    const [labRequests, setLabRequests] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedLabRequest, setSelectedLabRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailRequest, setDetailRequest] = useState(null);
    const [detailLabRequest, setDetailLabRequest] = useState(null);


    // Fetch lab requests and payments in parallel
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const [labRes, payRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/lab-requests', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8080/api/payments', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setLabRequests(labRes.data);
                setPayments(payRes.data);
            } catch (err) {
                setError('Không thể tải danh sách yêu cầu xét nghiệm hoặc thanh toán.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddClick = (request) => {
        setSelectedLabRequest(request);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setSelectedLabRequest(null);
    };


    const handleFormSubmitSuccess = () => {
        setShowForm(false);
        setSelectedLabRequest(null);
        // Không reload trang, chỉ đóng form/modal
        // Nếu muốn cập nhật lại bảng, có thể gọi lại fetchData() ở đây nếu cần
    };

    // Sắp xếp labRequests theo requestDate giảm dần
    const sortedLabRequests = [...labRequests].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    const filteredResults = sortedLabRequests.filter(request => {
        const search = searchTerm.toLowerCase();
        return (
            request.patientName?.toLowerCase().includes(search) ||
            request.doctorName?.toLowerCase().includes(search)
        );
    });

    // Hàm hiển thị chi tiết kết quả xét nghiệm
    const handleShowDetail = (request) => {
        setDetailRequest(request);
        setShowDetailModal(true);
    };


    // Helper: check if a lab request is paid
    const isLabRequestPaid = (labRequestId) => {
        return payments.some(p => p.labRequestId === labRequestId && p.status === 'PAID');
    };

    return (
        <div className="lab-results-table">
            <div className="table-header">
                <h2>Thêm kết quả xét nghiệm (cho các yêu cầu đang chờ)</h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            {loading && <div>Đang tải...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && (
                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                        <col style={{ width: '15%' }} /> {/* Tên bệnh nhân */}
                        <col style={{ width: '15%' }} /> {/* Tên bác sĩ */}
                        <col style={{ width: '15%' }} /> {/* Ngày yêu cầu */}
                        <col style={{ width: '15%' }} /> {/* Các xét nghiệm yêu cầu - giảm từ 26% xuống 20% */}
                        <col style={{ width: '15%' }} /> {/* Trạng thái */}
                        <col style={{ width: '20%' }} /> {/* Hành động */}
                    </colgroup>
                    <thead>
                        <tr>
                            <th style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>Tên bệnh nhân</th>
                            <th style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>Tên bác sĩ</th>
                            <th style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>Ngày yêu cầu</th>
                            <th style={{ textAlign: 'left' }}>Các xét nghiệm yêu cầu</th>
                            <th style={{ textAlign: 'left' }}>Trạng thái</th>
                            <th style={{ textAlign: 'center' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResults.map((request) => (
                            <tr key={request.id}>
                                <td style={{ wordBreak: 'break-word', verticalAlign: 'top' }}>{request.patientName}</td>
                                <td style={{ wordBreak: 'break-word', verticalAlign: 'top' }}>{request.doctorName}</td>
                                <td style={{ wordBreak: 'break-word', verticalAlign: 'top' }}>{new Date(request.requestDate).toLocaleString('vi-VN')}</td>
                                <td style={{ wordBreak: 'break-word', verticalAlign: 'top' }}>
                                    {request.labRequestItems && request.labRequestItems.length > 0 ? (
                                        <span className="tests-list">
                                            {request.labRequestItems.map(item => item.testTypeName).join(', ')}
                                        </span>
                                    ) : (
                                        <span className="no-note">Chưa có xét nghiệm</span>
                                    )}
                                </td>
                                <td style={{ wordBreak: 'break-word', verticalAlign: 'top' }}>
                                    {request.labRequestItems && request.labRequestItems.length > 0 ? (
                                        <span className="status-list">
                                            {request.labRequestItems.map(item =>
                                                item.resultValue && item.resultValue.trim() !== '' ? 'Đã có kết quả' : 'Chưa có kết quả'
                                            ).join(', ')}
                                        </span>
                                    ) : (
                                        <span className="no-note">Chưa có xét nghiệm</span>
                                    )}
                                </td>
                                <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', minWidth: 160 }}>
                                        <button onClick={() => handleShowDetail(request)} className="detail-btn"><FaEye /></button>
                                        {isLabRequestPaid(request.id) ? (
                                            <button onClick={() => handleAddClick(request)} className="add-btn">
                                                <FaPlus style={{ marginRight: 4 }} /> Thêm KQ
                                            </button>
                                        ) : (
                                            <span style={{ color: 'red', fontWeight: 500, whiteSpace: 'nowrap' }}>Đơn chưa thanh toán</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredResults.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '16px 0' }}>Không có yêu cầu xét nghiệm nào đang chờ.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {showForm && selectedLabRequest && (
                <LabResultForm
                    labRequest={selectedLabRequest}
                    onClose={handleFormClose}
                    onSubmitSuccess={handleFormSubmitSuccess}
                />
            )}

            {/* Modal chi tiết kết quả xét nghiệm */}
            {showDetailModal && detailRequest && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết kết quả xét nghiệm</h3>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-info">
                                <h4>Thông tin bệnh nhân</h4>
                                <p><strong>Tên:</strong> {detailRequest.patientName}</p>
                                <p><strong>Bác sĩ:</strong> {detailRequest.doctorName}</p>
                                <p><strong>Ngày yêu cầu:</strong> {new Date(detailRequest.requestDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="test-results">
                                <h4>Kết quả xét nghiệm</h4>
                                {detailRequest.labRequestItems && detailRequest.labRequestItems.length > 0 ? (
                                    <div className="results-list">
                                        {detailRequest.labRequestItems.map((item, index) => (
                                            <div key={index} className="result-item">
                                                <div className="test-name">{item.testTypeName}</div>
                                                <div className="test-result">
                                                    <span className="result-value">
                                                        {item.resultValue || 'Chưa có kết quả'}
                                                    </span>
                                                    {item.resultDate && (
                                                        <span className="result-date">
                                                            (Ngày: {new Date(item.resultDate).toLocaleDateString('vi-VN')})
                                                        </span>
                                                    )}
                                                </div>
                                                {item.notes && (
                                                    <div className="test-notes">
                                                        <strong>Ghi chú:</strong> {item.notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-results">Chưa có kết quả xét nghiệm.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabResultsTable; 